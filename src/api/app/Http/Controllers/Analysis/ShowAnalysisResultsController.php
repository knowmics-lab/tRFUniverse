<?php

namespace App\Http\Controllers\Analysis;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Bus;

class ShowAnalysisResultsController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  string  $analysisId
     *
     * @return array
     * @throws \JsonException
     */
    public function __invoke(string $analysisId): array
    {
        $batch = Bus::findBatch($analysisId);
        if ($batch === null) {
            abort(404, 'Analysis not found');
        }

        if (!$batch->finished()) {
            abort(500, 'Analysis not finished');
        }

        $cacheFile = $batch->options['cache_file'] ?? '';
        if (!file_exists($cacheFile)) {
            abort(500, 'Analysis results not found');
        }

        $options = $batch->options['action_options'] ?? [];
        $params = $options['params'] ?? [];
        $fragment = $options['fragment'] ?? null;

        $data = [
            'params' => $params,
            'data'   => json_decode(file_get_contents($cacheFile), true, 512, JSON_THROW_ON_ERROR),
        ];
        if (!is_null($fragment)) {
            $data['fragment'] = $fragment;
        }

        return $data;
    }
}
