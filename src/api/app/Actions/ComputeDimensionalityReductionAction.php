<?php

namespace App\Actions;

use App\Enums\ColorMetadataEnum;
use App\Enums\DimensionalityReductionMethodEnum;
use App\Enums\FilteringFunctionEnum;
use App\Interfaces\ActionInterface;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class ComputeDimensionalityReductionAction implements ActionInterface
{

    use Makeable;
    use DefaultCacheFileTrait;

    /**
     * @var array<string>
     */
    private readonly array $colorBy;
    /**
     * @var array<string>
     */
    private readonly array $covariates;

    /**
     *
     * @param  array<string>  $datasets
     * @param  array<\App\Enums\ColorMetadataEnum>  $colorBy
     * @param  bool  $scaling
     * @param  \App\Enums\DimensionalityReductionMethodEnum  $method
     * @param  array  $subtypes
     * @param  array  $sampleTypes
     * @param  float  $perplexity
     * @param  array<string|\App\Models\Metadata>  $covariates
     */
    public function __construct(
        private readonly array $datasets,
        array $colorBy,
        private readonly bool $scaling = false,
        private readonly DimensionalityReductionMethodEnum $method = DimensionalityReductionMethodEnum::PCA,
        private readonly array $subtypes = [],
        private readonly array $sampleTypes = [],
        private readonly float $perplexity = 30.0,
        array $covariates = [],
        private readonly bool $filtering = false,
        private readonly int $filteringTop = 100,
        private readonly FilteringFunctionEnum $filteringMeasure = FilteringFunctionEnum::MAD,
    ) {
        $this->colorBy = array_map(
            static fn(ColorMetadataEnum $colorBy) => $colorBy->value,
            $colorBy
        );
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
            CommandExecutor::forScript('compute_dimensionality_reduction')
                           ->withArguments(
                               '-e',
                               config('trfuniverse.expressions_path'),
                               '-o',
                               $cacheFile,
                               '-m',
                               $this->method->value,
                           )
                           ->withRepeatedArguments('-d', $this->datasets)
                           ->withRepeatedArguments('-c', $this->colorBy)
                           ->withFlag('-z', $this->scaling)
                           ->withConditionalArguments(
                               $this->method === DimensionalityReductionMethodEnum::TSNE,
                               '-p',
                               $this->perplexity
                           )
                           ->withConditionalArguments(!empty($this->subtypes), '-s', $this->subtypes)
                           ->withConditionalArguments(!empty($this->sampleTypes), '-a', $this->sampleTypes)
                           ->withConditionalArguments(!empty($this->covariates), '-v', $this->covariates)
                           ->withFlag('-f', $this->filtering)
                           ->withConditionalArguments($this->filtering, '-t', $this->filteringTop)
                           ->withConditionalArguments($this->filtering, '-M', $this->filteringMeasure->value)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }

}