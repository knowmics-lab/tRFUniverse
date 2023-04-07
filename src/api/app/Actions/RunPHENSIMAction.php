<?php

namespace App\Actions;

use App\Interfaces\ActionInterface;
use App\Models\Fragment;
use App\Traits\DefaultCacheFileTrait;
use App\Traits\Makeable;
use App\TrfExplorer\CommandExecutor;
use App\TrfExplorer\Utils;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use RuntimeException;

/**
 * @implements ActionInterface<array>
 */
class RunPHENSIMAction implements ActionInterface
{

    use Makeable;
    use DefaultCacheFileTrait {
        getCacheFile as private originalGetCacheFile;
    }

    protected string $cacheFileExtension = '';
    protected bool $publicCacheFile = true;

    /**
     * @var string
     */
    private readonly string $fragment;

    public function __construct(
        string|Fragment $fragment,
        private readonly array|null $evidences = null,
        private readonly string|null $dataset = null,
        private readonly float $pvalue = 0.05,
        private readonly bool $useReactome = true,
        private readonly float $epsilon = 0.0000001,
        private readonly int $seed = 1234,
        private readonly string|null $notifyTo = null,
        private readonly string|null $notifyUrl = null,
    ) {
        $this->fragment = $fragment instanceof Fragment ? $fragment->name : $fragment;
    }

    public function getCacheFile(): string
    {
        return $this->originalGetCacheFile().'/results.json';
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
            $analysisId = basename($cacheDir);
            $phensimInputFile = $cacheDir.'/phensim_input.tsv';
            $phensimInputJsonTableFile = $cacheDir.'/phensim_input.json';
            CommandExecutor::forScript('compute_phensim_input')
                           ->withArguments(
                               '-f',
                               $this->fragment,
                               '-t',
                               config('trfuniverse.raw_data_files.targets_lfcs_matrix_rds'),
                               '-o',
                               $phensimInputFile,
                               '-O',
                               $phensimInputJsonTableFile,
                           )
                           ->withConditionalArguments(!empty($this->evidences), '-e', $this->evidences)
                           ->withConditionalArguments(!empty($this->dataset), '-d', $this->dataset)
                           ->withConditionalArguments(!empty($this->dataset), '-p', $this->pvalue)
                           ->withCwd(dirname($cacheFile))
                           ->execute();
            $phensimServerEndpoint = config('trfuniverse.phensim.url').'/simulations';
            $phensimServerResponse = Http::withToken(config('trfuniverse.phensim.token'))
                                         ->acceptJson()
                                         ->attach(
                                             'simulationParametersFile',
                                             file_get_contents($phensimInputFile),
                                             'phensim_input.tsv'
                                         )
                                         ->post(
                                             $phensimServerEndpoint,
                                             [
                                                 'name'           => 'tRFExplorer_'.$analysisId,
                                                 'organism'       => 'hsa',
                                                 'seed'           => $this->seed,
                                                 'fdr'            => 'BH',
                                                 'reactome'       => $this->useReactome ? '1' : '0',
                                                 'fast'           => '1',
                                                 'miRNAs'         => '1',
                                                 'miRNAsEvidence' => 'STRONG',
                                                 'epsilon'        => $this->epsilon,
                                                 'callback'       => $this->makeCallbackURL($analysisId),
                                                 'submit'         => '1',
                                             ]
                                         );
            if (!$phensimServerResponse->successful()) {
                throw new RuntimeException('The PHENSIM server returned an error: '.$phensimServerResponse->body());
            }
            $responseData = $phensimServerResponse->json();
            $id = $responseData['data']['id'] ?? null;
            $status = strtolower($responseData['data']['readable_status'] ?? 'error');
            $logs = '';
            file_put_contents(
                $cacheFile,
                json_encode(
                    [
                        'phensim_id'       => $id,
                        'status'           => $status,
                        'logs'             => $logs,
                        'input_table_file' => Utils::publicCacheFileRelative($phensimInputJsonTableFile),
                        'input_table_url'  => Utils::publicCacheFileUrl($phensimInputJsonTableFile),
                        'raw_output'       => null,
                        'results'          => [],
                    ],
                    JSON_THROW_ON_ERROR
                )
            );
            $this->writeNotifyTo();
        }

        return json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR);
    }

    protected function makeCallbackURL(string $analysisId): string
    {
        $debugUrl = config('trfuniverse.phensim.callback_debug_url');
        $signedRoute = URL::temporarySignedRoute(
            'api.phensim.callback',
            now()->addDay(),
            ['analysisId' => $analysisId],
            false
        );
        if (!empty($debugUrl)) {
            return $debugUrl.$signedRoute;
        }

        return url($signedRoute);
    }

    /**
     * @throws \JsonException
     */
    protected function writeNotifyTo(): void
    {
        if (!empty($this->notifyTo)) {
            $notifyToFile = $this->originalGetCacheFile().'/notify_to.json';
            file_put_contents(
                $notifyToFile,
                json_encode(
                    [
                        Crypt::encrypt(
                            [
                                'notify_to'  => $this->notifyTo,
                                'notify_url' => $this->notifyUrl,
                            ]
                        ),
                    ],
                    JSON_THROW_ON_ERROR
                )
            );
        }
    }
}