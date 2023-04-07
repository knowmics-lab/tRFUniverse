<?php

namespace App\Actions;

use App\Enums\ExpressionTypeEnum;
use App\Enums\SurvivalMeasureEnum;
use App\Interfaces\ActionInterface;
use App\Models\Fragment;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class BuildSurvivalPlotAction implements ActionInterface
{

    use DefaultCacheFileTrait;
    use Makeable;

    private readonly string $fragment;
    private readonly string $metadata;
    private readonly string $type;
    /**
     * @var array<string>
     */
    private readonly array $covariates;

    public function __construct(
        private readonly string $dataset,
        Fragment|string $fragment,
        SurvivalMeasureEnum $metadata,
        ExpressionTypeEnum $type,
        private readonly float $cutoffHigh = 0.5,
        private readonly float $cutoffLow = 0.5,
        private readonly array $subtypes = [],
        private readonly array $sampleTypes = [],
        array $covariates = [],
        private readonly float|null $leftCensoring = null,
        private readonly float|null $rightCensoring = null
    ) {
        $this->fragment = $fragment instanceof Fragment ? $fragment->name : $fragment;
        $this->metadata = $metadata->value;
        $this->type = $type->value;
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
            CommandExecutor::forScript('build_survival')
                           ->withArguments(
                               '-d',
                               $this->dataset,
                               '-f',
                               $this->fragment,
                               '-m',
                               $this->metadata,
                               '-e',
                               config('trfuniverse.expressions_path'),
                               '-t',
                               $this->type,
                               '-o',
                               $cacheFile,
                               '-l',
                               $this->cutoffLow,
                               '-i',
                               $this->cutoffHigh,
                           )
                           ->withConditionalArguments(!empty($this->subtypes), '-s', $this->subtypes)
                           ->withConditionalArguments(!empty($this->sampleTypes), '-a', $this->sampleTypes)
                           ->withConditionalArguments(
                               !empty($this->covariates) && $this->type === ExpressionTypeEnum::NORM_COUNTS->value,
                               '-v',
                               $this->covariates
                           )
                           ->withConditionalArguments(!empty($this->leftCensoring), '-L', $this->leftCensoring)
                           ->withConditionalArguments(!empty($this->rightCensoring), '-R', $this->rightCensoring)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }
}