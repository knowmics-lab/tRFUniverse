<?php

namespace App\Actions;

use App\Enums\ComparisonExpressionTypeEnum;
use App\Enums\CorrelationMeasureEnum;
use App\Enums\FilterDirectionEnum;
use App\Interfaces\ActionInterface;
use App\Models\Fragment;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class ComputeCorrelatedEnrichmentAnalysisAction implements ActionInterface
{

    use DefaultCacheFileTrait;
    use Makeable;

    private readonly string $fragment;
    /**
     * @var array<string>
     */
    private readonly array $covariates;

    public function __construct(
        private readonly string $dataset,
        Fragment|string $fragment,
        private readonly array $subtypes = [],
        private readonly array $sampleTypes = [],
        private readonly CorrelationMeasureEnum $measure = CorrelationMeasureEnum::PEARSON,
        private readonly ComparisonExpressionTypeEnum $type = ComparisonExpressionTypeEnum::GENES,
        array $covariates = [],
        private readonly float $correlationThreshold = 0.5,
        private readonly FilterDirectionEnum $filterDirection = FilterDirectionEnum::BOTH,
    ) {
        $this->fragment = $fragment instanceof Fragment ? $fragment->name : $fragment;
        $this->covariates = array_map(
            static fn(string|Metadata $covariate) => $covariate instanceof Metadata ? $covariate->name : $covariate,
            $covariates
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
            CommandExecutor::forScript('compute_correlated_enrichment')
                           ->withArguments(
                               '-f',
                               $this->fragment,
                               '-d',
                               $this->dataset,
                               '-e',
                               config('trfuniverse.expressions_path'),
                               '-t',
                               $this->type->value,
                               '-c',
                               $this->measure->value,
                               '-o',
                               $cacheFile,
                               '-T',
                               $this->correlationThreshold,
                               '-F',
                               $this->filterDirection->value,
                           )
                           ->withConditionalArguments(!empty($this->subtypes), '-s', $this->subtypes)
                           ->withConditionalArguments(!empty($this->sampleTypes), '-a', $this->sampleTypes)
                           ->withConditionalArguments(!empty($this->covariates), '-v', $this->covariates)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }
}