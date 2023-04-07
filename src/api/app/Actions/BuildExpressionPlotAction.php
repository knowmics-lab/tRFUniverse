<?php

namespace App\Actions;

use App\Enums\ExpressionTypeEnum;
use App\Interfaces\ActionInterface;
use App\Models\Fragment;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;

/**
 * @implements ActionInterface<array>
 */
class BuildExpressionPlotAction implements ActionInterface
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
        Metadata|string $metadata,
        ExpressionTypeEnum $type,
        array $covariates = []
    ) {
        $this->fragment = $fragment instanceof Fragment ? $fragment->name : $fragment;
        $this->metadata = $metadata instanceof Metadata ? $metadata->name : $metadata;
        $this->type = $type->value;
        $this->covariates = array_map(
            static fn(string|Metadata $covariate) => $covariate instanceof Metadata ? $covariate->name : $covariate,
            $covariates
        );
    }

    /**
     * @throws \JsonException|\App\Exceptions\ProcessingJobException
     */
    public function handle(): array
    {
        $cacheFile = $this->getCacheFile();
        if (!file_exists($cacheFile)) {
            CommandExecutor::forScript('build_expression_graph')
                           ->withArguments(
                               '-d',
                               $this->dataset,
                               '-f',
                               $this->fragment,
                               '-m',
                               $this->metadata,
                               '-t',
                               $this->type,
                               '-o',
                               $cacheFile,
                               '-e',
                               config('trfuniverse.expressions_path')
                           )
                           ->withConditionalArguments(
                               !empty($this->covariates) && $this->type === ExpressionTypeEnum::NORM_COUNTS->value,
                               '-v',
                               $this->covariates
                           )
                           ->withCwd(dirname($cacheFile))
                           ->execute();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }
}