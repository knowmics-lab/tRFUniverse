<?php

namespace App\Actions;

use App\Interfaces\ActionInterface;
use App\Models\Metadata;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;
use App\TrfExplorer\Utils;
use RuntimeException;

/**
 * @implements ActionInterface<array>
 */
class ComputeDifferentiallyExpressedFragmentsAction implements ActionInterface
{

    use Makeable;
    use DefaultCacheFileTrait {
        getCacheFile as private originalGetCacheFile;
    }

    protected string $cacheFileExtension = '';
    protected bool $publicCacheFile = true;

    /**
     * @var array<string>
     */
    private readonly array $metadata;
    /**
     * @var array<string>
     */
    private readonly array $contrasts;
    /**
     * @var array<string>
     */
    private readonly array $covariates;

    /**
     *
     * @param  string  $dataset
     * @param  array<string|\App\Models\Metadata>  $metadata
     * @param  array<string|array<string|int,string|array<string>>>  $contrasts
     * @param  float  $logFCCutoff
     * @param  float  $qvalueCutoff
     * @param  float  $minCountCutoff
     * @param  float  $minTotalCountCutoff
     * @param  float  $minProp
     * @param  array<string|\App\Models\Metadata>  $covariates
     */
    public function __construct(
        private readonly string $dataset,
        array $metadata,
        array $contrasts,
        private readonly float $logFCCutoff = 0.6,
        private readonly float $qvalueCutoff = 0.05,
        private readonly float $minCountCutoff = 5,
        private readonly float $minTotalCountCutoff = 15,
        private readonly float $minProp = 0.7,
        array $covariates = []
    ) {
        $this->metadata = array_map(
            static fn(string|Metadata $m) => $m instanceof Metadata ? $m->name : $m,
            $metadata
        );
        $this->covariates = array_map(
            static fn(string|Metadata $c) => $c instanceof Metadata ? $c->name : $c,
            $covariates
        );
        $this->buildContrasts($contrasts);
    }

    /**
     * @param  array<string|array<string|int,string|array<string>>>  $inputContrasts
     */
    protected function buildContrasts(array $inputContrasts): void
    {
        $outputContrasts = [];
        foreach ($inputContrasts as $contrast) {
            if (is_string($contrast)) {
                $outputContrasts[] = $contrast;
            } else {
                if (isset($contrast['case'], $contrast['control'])) {
                    $case = $contrast['case'];
                    $control = $contrast['control'];
                } else {
                    $control = array_shift($contrast);
                    $case = array_shift($contrast);
                }
                $fnReplace = static fn(string $s) => preg_replace('/\W+/', '_', $s);
                $case = array_map($fnReplace, is_array($case) ? $case : [$case]);
                $control = array_map($fnReplace, is_array($control) ? $control : [$control]);
                $outputContrasts[] = implode('__+__', $control).'__vs__'.implode('__+__', $case);
            }
        }
        $this->contrasts = $outputContrasts;
    }

    /**
     * @throws \JsonException
     * @throws \App\Exceptions\ProcessingJobException
     */
    public function handle(): array
    {
        $cacheFile = $this->getCacheFile();
        if (!file_exists($cacheFile)) {
            $cacheDir = dirname($cacheFile);
            if (!file_exists($cacheDir) && !mkdir($cacheDir, 0755, true) && !is_dir($cacheDir)) {
                throw new RuntimeException(sprintf('Directory "%s" was not created', $cacheDir));
            }
            CommandExecutor::forScript('compute_degs')
                           ->withArguments(
                               '-d',
                               $this->dataset,
                               '-e',
                               config('trfuniverse.expressions_path'),
                               '-o',
                               $cacheDir,
                               '-l',
                               $this->logFCCutoff,
                               '-q',
                               $this->qvalueCutoff,
                               '-M',
                               $this->minCountCutoff,
                               '-T',
                               $this->minTotalCountCutoff,
                               '-P',
                               $this->minProp
                           )
                           ->withRepeatedArguments('-m', $this->metadata)
                           ->withRepeatedArguments('-c', $this->contrasts)
                           ->withConditionalArguments(!empty($this->covariates), '-v', $this->covariates)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
            $tmpResults = json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
            $tmpResults = array_filter(
                array_map(
                    static function (array $result) {
                        if (!isset($result['contrasts'], $result['file.name']) || !file_exists($result['file.name'])) {
                            return null;
                        }
                        $file = Utils::publicCacheFileRelative($result['file.name']);
                        $url = Utils::publicCacheFileUrl($result['file.name']);

                        return [
                            'contrasts' => $result['contrasts'],
                            'url'       => $url,
                            'file_name' => $file,
                        ];
                    },
                    $tmpResults
                )
            );
            file_put_contents($cacheFile, json_encode($tmpResults, JSON_THROW_ON_ERROR));
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }

    public function getCacheFile(): string
    {
        return $this->originalGetCacheFile().'/results.json';
    }
}