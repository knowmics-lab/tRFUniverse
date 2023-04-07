<?php

namespace App\Http\Controllers\Analysis\Differential;

use App\Actions\BatchableAction;
use App\Actions\ComputeDifferentiallyExpressedFragmentsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\DifferentiallyExpressedAnalysisRequest;

class DifferentialExpressionAnalysisController extends Controller
{

    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\DifferentiallyExpressedAnalysisRequest  $request
     *
     * @return array
     * @throws \App\Exceptions\ProcessingJobException
     * @throws \Throwable
     */
    public function __invoke(DifferentiallyExpressedAnalysisRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeDifferentiallyExpressedFragmentsAction::class,
                [
                    $params['dataset'],
                    $params['metadata'],
                    $params['contrasts'],
                    $params['logfc_cutoff'],
                    $params['qvalue_cutoff'],
                    $params['min_count_cutoff'],
                    $params['min_total_count_cutoff'],
                    $params['min_prop'],
                    $params['covariates'],
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
