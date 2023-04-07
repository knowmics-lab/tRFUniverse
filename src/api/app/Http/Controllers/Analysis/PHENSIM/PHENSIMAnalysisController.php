<?php

namespace App\Http\Controllers\Analysis\PHENSIM;

use App\Actions\BatchableAction;
use App\Actions\RunPHENSIMAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\PHENSIMAnalysisRequest;
use App\Models\Fragment;

class PHENSIMAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\PHENSIMAnalysisRequest  $request
     * @param  \App\Models\Fragment  $fragment
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(PHENSIMAnalysisRequest $request, Fragment $fragment): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                RunPHENSIMAction::class,
                [
                    $fragment->name,
                    $params['evidences'],
                    $params['dataset'],
                    $params['pvalue'],
                    $params['reactome'],
                    $params['epsilon'],
                    $params['seed'],
                    $params['notify_to'],
                    $params['notify_url'],
                ]
            )->withOption('params', $params)->withOption('fragment', $fragment->id)->handle()
        );
    }
}
