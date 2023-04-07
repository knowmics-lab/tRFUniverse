<?php

namespace App\Actions;

use App\Interfaces\ActionInterface;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class ComputeMetadataValuesAction implements ActionInterface
{
    use DefaultCacheFileTrait;
    use Makeable;

    /**
     * @var array<string>
     */
    private readonly array $metadata;

    /**
     * @param  string  $dataset
     * @param  array<string|\App\Models\Metadata>  $metadata
     */
    public function __construct(
        private readonly string $dataset,
        array $metadata,
    ) {
        $this->metadata = array_map(
            static fn(string|Metadata $m) => $m instanceof Metadata ? $m->name : $m,
            $metadata
        );
    }

    /**
     * @throws \JsonException
     * @throws \App\Exceptions\ProcessingJobException
     */
    public function handle(): array
    {
        $cacheFile = $this->getCacheFile();
        if (!file_exists($cacheFile)) {
            CommandExecutor::forScript('compute_meta_values')
                           ->withArguments(
                               '-d',
                               $this->dataset,
                               '-e',
                               config('trfuniverse.expressions_path'),
                               '-o',
                               $cacheFile,
                           )
                           ->withRepeatedArguments('-m', $this->metadata)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }
}