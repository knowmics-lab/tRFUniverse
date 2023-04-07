<?php

namespace App\Jobs;

use App\Events\AnalysisCanceled;
use App\Events\AnalysisCompleted;
use App\Events\AnalysisError;
use App\Events\AnalysisProcessing;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * @template T of \App\Traits\Makeable
 */
class PerformActionJob implements ShouldQueue
{
    use Batchable;
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param  class-string<T>  $actionClass
     * @param  array  $actionParams
     *
     * @return void
     */
    public function __construct(protected string $actionClass, protected array $actionParams = []) {}

    /**
     * Execute the job.
     *
     * @return void
     * @throws \Throwable
     */
    public function handle(): void
    {
        AnalysisProcessing::dispatch($this->batch()->id);
        if ($this->batch()?->canceled()) {
            AnalysisCanceled::dispatch($this->batch()->id);

            return;
        }
        try {
            $this->actionClass::make(...$this->actionParams)->handle();
            AnalysisCompleted::dispatch($this->batch()->id);
        } catch (Throwable $e) {
            Log::error($e->getMessage(), $e->getTrace());
            AnalysisError::dispatch($this->batch()->id, $e->getMessage(), $e->getTraceAsString());
            throw $e;
        }
    }
}
