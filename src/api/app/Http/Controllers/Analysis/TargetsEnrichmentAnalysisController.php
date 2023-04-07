<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\BatchableAction;
use App\Actions\ComputeTargetEnrichmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\TargetEnrichmentAnalysisRequest;
use App\Models\Fragment;

class TargetsEnrichmentAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\TargetEnrichmentAnalysisRequest  $request
     * @param  \App\Models\Fragment  $fragment
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(TargetEnrichmentAnalysisRequest $request, Fragment $fragment): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeTargetEnrichmentAction::class,
                [
                    $fragment->name,
                    $params['evidences'],
                    $params['dataset'],
                    $params['pvalue'],
                ]
            )->withOption('params', $params)->withOption('fragment', $fragment->id)->handle()
        );
    }
}
