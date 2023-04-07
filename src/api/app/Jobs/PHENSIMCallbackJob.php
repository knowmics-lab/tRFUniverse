<?php

namespace App\Jobs;

use App\Mail\AnalysisCompleted;
use App\TrfExplorer\Utils;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Log;

class PHENSIMCallbackJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    private const FIELDS_ALL = [
        'pathwayId',
        'pathwayName',
        'nodeId',
        'nodeName',
        'isEndpoint',
        'isDirectTarget',
        'activityScore',
        'pValue',
        'FDR',
        'LL',
        'pathwayActivityScore',
        'pathwayPValue',
        'pathwayFDR',
        'pathwayLL',
        'targetedBy',
        'averagePerturbation',
        'averagePathwayPerturbation',
    ];

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        private readonly string $analysisId,
        private readonly int $phensimId,
        private readonly string $status,
        private readonly string|null $logs = null,
    ) {}

    /**
     * Execute the job.
     *
     * @return void
     * @throws \JsonException
     */
    public function handle(): void
    {
        $cachePath = Utils::publicCachePath($this->analysisId, '');
        $resultFile = $cachePath.'/results.json';
        if (!file_exists($resultFile)) {
            Log::error("Cache file $resultFile does not exist.");

            return;
        }
        $results = json_decode(file_get_contents($resultFile), true, 512, JSON_THROW_ON_ERROR);
        $jobPhensimId = $results['phensim_id'] ?? null;
        if ($jobPhensimId !== $this->phensimId) {
            Log::error("Phensim ID mismatch: $jobPhensimId !== {$this->phensimId}");

            return;
        }
        $results['status'] = $this->status;
        $results['logs'] = $this->logs;
        $notify = false;
        if ($this->status === 'completed') {
            $phensimOutputUrl = $this->getPhensimOutputUrl();
            if ($phensimOutputUrl === false) {
                $results['status'] = 'error';
                $results['logs'] .= PHP_EOL.'Could not get the PHENSIM output URL.';
            } else {
                $outputFile = $cachePath.'/phensim_output.tsv';
                $this->downloadPhensimOutput($phensimOutputUrl, $outputFile);
                $results['raw_output'] = Utils::publicCacheFileUrl($outputFile);
                [$pathwayListOutputFile, $pathwayOutputFiles] = $this->processOutput($outputFile, $cachePath);
                $results['results'] = [
                    'pathway_list' => $pathwayListOutputFile,
                    'pathways'     => $pathwayOutputFiles,
                ];
                $notify = true;
            }
        }
        file_put_contents($resultFile, json_encode($results, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
        if ($notify) {
            $this->notify($cachePath);
        }
    }

    private function getPhensimOutputUrl()
    {
        $phensimServerEndpoint = config('trfuniverse.phensim.url').'/simulations/'.$this->phensimId;
        $phensimServerResponse = Http::withToken(config('trfuniverse.phensim.token'))
                                     ->acceptJson()
                                     ->get($phensimServerEndpoint);
        if (!$phensimServerResponse->successful()) {
            Log::error('The PHENSIM server returned an error: '.$phensimServerResponse->body());

            return false;
        }
        $responseData = $phensimServerResponse->json();

        return $responseData['data']['links']['output'] ?? false;
    }

    private function downloadPhensimOutput(string $url, string $outputFile): void
    {
        $ch = curl_init($url);
        $fp = fopen($outputFile, 'wb');
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.config('trfuniverse.phensim.token')]);
        curl_exec($ch);
        curl_close($ch);
        fclose($fp);
    }

    /**
     * @throws \JsonException
     */
    private function processOutput(string $phensimOutputFile, string $outputDirectory): array
    {
        $pathways = [];
        $nodesByPathway = [];
        $fp = fopen($phensimOutputFile, 'rb');
        while (($data = fgetcsv($fp, separator: "\t")) !== false) {
            if (count($data) !== 17) {
                continue;
            }
            if (str_starts_with($data[0], '#')) {
                continue;
            }
            $data = array_combine(self::FIELDS_ALL, $data);
            $pathwayId = $data['pathwayId'];
            if (!isset($pathways[$pathwayId])) {
                $pathways[$pathwayId] = [
                    'pathwayId'                  => $pathwayId,
                    'pathwayName'                => self::cleanPathwayName($data['pathwayName']),
                    'pathwayActivityScore'       => (double)$data['pathwayActivityScore'],
                    'pathwayPValue'              => (double)$data['pathwayPValue'],
                    'pathwayFDR'                 => (double)$data['pathwayFDR'],
                    'averagePathwayPerturbation' => (double)$data['averagePathwayPerturbation'],
                ];
                $nodesByPathway[$pathwayId] = [];
            }
            $nodesByPathway[$pathwayId][] = [
                'nodeId'              => $data['nodeId'],
                'nodeName'            => $data['nodeName'],
                'isEndpoint'          => strtolower($data['isEndpoint']) === 'yes',
                'activityScore'       => (double)$data['activityScore'],
                'pValue'              => (double)$data['pValue'],
                'FDR'                 => (double)$data['FDR'],
                'averagePerturbation' => (double)$data['averagePerturbation'],
            ];
        }
        @fclose($fp);
        $pathwayListOutputFile = $outputDirectory.'/pathways.json';
        $pathwayOutputFileFormat = $outputDirectory.'/pathway_%s.json';
        $pathwayOutputFiles = [];
        file_put_contents(
            $pathwayListOutputFile,
            json_encode(['data' => array_values($pathways)], JSON_THROW_ON_ERROR)
        );
        foreach ($nodesByPathway as $pathwayId => $data) {
            $filename = sprintf($pathwayOutputFileFormat, Str::slug($pathwayId));
            file_put_contents($filename, json_encode(['data' => $data], JSON_THROW_ON_ERROR));
            $pathwayOutputFiles[$pathwayId] = Utils::publicCacheFileUrl($filename);
        }

        return [Utils::publicCacheFileUrl($pathwayListOutputFile), $pathwayOutputFiles];
    }

    private static function cleanPathwayName(string $name): string
    {
        return preg_replace('/\s+-\s+enriched/i', '', $name);
    }

    /**
     * @throws \JsonException
     */
    private function notify(string $outputDirectory): void
    {
        $notifyToFile = $outputDirectory.'/notify_to.json';
        if (file_exists($notifyToFile)) {
            $data = json_decode(file_get_contents($notifyToFile), true, 512, JSON_THROW_ON_ERROR);
            $data = Crypt::decrypt($data[0]);
            $notifyTo = $data['notify_to'] ?? null;
            $notifyUrl = $data['notify_url'] ?? null;
            if (!empty($notifyTo)) {
                Mail::to($notifyTo)->queue(new AnalysisCompleted('PHENSIM', $notifyUrl));
            }
        }
    }
}
