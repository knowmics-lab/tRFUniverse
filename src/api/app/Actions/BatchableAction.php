<?php

namespace App\Actions;

use App\Interfaces\ActionInterface;
use App\Jobs\PerformActionJob;
use App\Traits\Makeable;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

/**
 * @template U of \App\Interfaces\ActionInterface
 * @implements ActionInterface<array>
 */
class BatchableAction implements ActionInterface
{
    use Makeable;

    /**
     * @var U
     */
    protected mixed $actionObject = null;

    protected ?Batch $batch = null;

    protected array $options = [];

    /**
     * Create a new job instance.
     *
     * @param  class-string<U>  $actionClass
     * @param  array  $actionParams
     *
     * @return void
     */
    public function __construct(protected string $actionClass, protected array $actionParams = []) {}

    public static function statusArrayFromBatch(string $analysisId): array
    {
        $batch = Bus::findBatch($analysisId);
        if ($batch === null) {
            abort(404, 'Analysis not found');
        }

        return [
            'id'         => $batch->id,
            'status'     => self::batchStatusText($batch),
            'progress'   => $batch->progress(),
            'createdAt'  => $batch->createdAt,
            'finishedAt' => $batch->finishedAt,
            'options'    => $batch->options['action_options'] ?? [],
        ];
    }

    private static function batchStatusText(Batch $batch): string
    {
        if ($batch->failedJobs > 0) {
            return 'failed';
        }

        return ($batch->finishedAt === null) ? 'pending' : 'finished';
    }

    public function getBatch(): ?Batch
    {
        return $this->batch;
    }

    public function withOption(string $key, mixed $value): static
    {
        $this->options[$key] = $value;

        return $this;
    }

    /**
     * @throws \Throwable
     */
    public function handle(): array
    {
        $this->batch = Bus::batch([new PerformActionJob($this->actionClass, $this->actionParams)])
                          ->withOption('cache_file', $this->getCacheFile())
                          ->withOption('action_class', $this->actionClass)
                          ->withOption('action_params', $this->actionParams)
                          ->withOption('action_options', $this->options)
                          ->dispatch();

        return [
            'analysisId' => $this->batch->id,
        ];
    }

    public function getCacheFile(): string
    {
        return $this->getActionObject()->getCacheFile();
    }

    /**
     * @return U
     */
    public function getActionObject(): mixed
    {
        if (is_null($this->actionObject)) {
            $this->actionObject = new $this->actionClass(...$this->actionParams);
        }

        return $this->actionObject;
    }
}