<?php

namespace App\Actions;

use App\Enums\FilteringFunctionEnum;
use App\Interfaces\ActionInterface;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class ComputeClusteringAction implements ActionInterface
{

    use Makeable;
    use DefaultCacheFileTrait;

    /**
     * @var array<string>
     */
    private readonly array $metadata;
    /**
     * @var array<string>
     */
    private readonly array $covariates;

    /**
     *
     * @param  array<string>  $datasets
     * @param  array<string|\App\Models\Metadata>  $metadata
     * @param  array  $subtypes
     * @param  array  $sampleTypes
     * @param  array<string|\App\Models\Metadata>  $covariates
     * @param  bool  $filtering
     * @param  int  $filteringTop
     * @param  \App\Enums\FilteringFunctionEnum  $filteringMeasure
     */
    public function __construct(
        private readonly array $datasets,
        array $metadata,
        private readonly array $subtypes = [],
        private readonly array $sampleTypes = [],
        array $covariates = [],
        private readonly bool $filtering = false,
        private readonly int $filteringTop = 100,
        private readonly FilteringFunctionEnum $filteringMeasure = FilteringFunctionEnum::MAD,
    ) {
        $this->metadata = array_map(
            static fn(string|Metadata $m) => $m instanceof Metadata ? $m->name : $m,
            $metadata
        );
        $this->covariates = array_map(
            static fn(string|Metadata $covariate) => $covariate instanceof Metadata ? $covariate->name : $covariate,
            $covariates
        );
    }

    /**
     * @throws \App\Exceptions\ProcessingJobException
     * @throws \JsonException
     */
    public function handle(): array
    {
        $cacheFile = $this->getCacheFile();
        if (!file_exists($cacheFile)) {
            $outputId = basename($cacheFile, '.json');
            $outputFile = dirname($cacheFile).DIRECTORY_SEPARATOR.$outputId.'_output.json';
            CommandExecutor::forScript('compute_clustering')
                           ->withArguments(
                               '-e',
                               config('trfuniverse.expressions_path'),
                               '-o',
                               $outputFile,
                           )
                           ->withRepeatedArguments('-d', $this->datasets)
                           ->withRepeatedArguments('-m', $this->metadata)
                           ->withConditionalArguments(!empty($this->subtypes), '-s', $this->subtypes)
                           ->withConditionalArguments(!empty($this->sampleTypes), '-a', $this->sampleTypes)
                           ->withConditionalArguments(!empty($this->covariates), '-v', $this->covariates)
                           ->withFlag('-f', $this->filtering)
                           ->withConditionalArguments($this->filtering, '-t', $this->filteringTop)
                           ->withConditionalArguments($this->filtering, '-M', $this->filteringMeasure->value)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
            $data = [
                'url'  => route('morpheus', ['dataKey' => $outputId]),
                'path' => route('morpheus', ['dataKey' => $outputId], false),
            ];
            file_put_contents($cacheFile, json_encode($data, JSON_THROW_ON_ERROR));
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }

}