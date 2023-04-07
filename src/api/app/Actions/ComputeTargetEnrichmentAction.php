<?php

namespace App\Actions;

use App\Interfaces\ActionInterface;
use App\Models\Fragment;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class ComputeTargetEnrichmentAction implements ActionInterface
{

    use DefaultCacheFileTrait;
    use Makeable;

    /**
     * @var string
     */
    private readonly string $fragment;

    public function __construct(
        string|Fragment $fragment,
        private readonly array|null $evidences = null,
        private readonly string|null $dataset = null,
        private readonly float $pvalue = 0.05
    ) {
        $this->fragment = $fragment instanceof Fragment ? $fragment->name : $fragment;
    }

    /**
     * @throws \JsonException
     * @throws \App\Exceptions\ProcessingJobException
     */
    public
    function handle(): array
    {
        $cacheFile = $this->getCacheFile();
        if (!file_exists($cacheFile)) {
            CommandExecutor::forScript('compute_targets_enrichment')
                           ->withArguments(
                               '-f',
                               $this->fragment,
                               '-t',
                               config('trfuniverse.raw_data_files.targets_lfcs_matrix_rds'),
                               '-o',
                               $cacheFile,
                           )
                           ->withConditionalArguments(!empty($this->evidences), '-e', $this->evidences)
                           ->withConditionalArguments(!empty($this->dataset), '-d', $this->dataset)
                           ->withConditionalArguments(!empty($this->dataset), '-p', $this->pvalue)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }
}