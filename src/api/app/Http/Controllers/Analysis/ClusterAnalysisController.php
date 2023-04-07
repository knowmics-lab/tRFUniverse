<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\BatchableAction;
use App\Actions\ComputeClusteringAction;
use App\Enums\FilteringFunctionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\ClusteringRequest;

class ClusterAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\ClusteringRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(ClusteringRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeClusteringAction::class,
                [
                    $params['datasets'],
                    $params['metadata'],
                    $params['subtypes'],
                    $params['sample_types'],
                    $params['covariates'],
                    $params['filtering'],
                    $params['filtering_top'],
                    FilteringFunctionEnum::from($params['filtering_measure']),
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
