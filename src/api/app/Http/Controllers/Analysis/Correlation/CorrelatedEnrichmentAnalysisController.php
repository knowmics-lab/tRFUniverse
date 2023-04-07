<?php

namespace App\Http\Controllers\Analysis\Correlation;

use App\Actions\BatchableAction;
use App\Actions\ComputeCorrelatedEnrichmentAnalysisAction;
use App\Enums\ComparisonExpressionTypeEnum;
use App\Enums\CorrelationMeasureEnum;
use App\Enums\FilterDirectionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\CorrelatedEnrichmentAnalysisRequest;

class CorrelatedEnrichmentAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\CorrelatedEnrichmentAnalysisRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(CorrelatedEnrichmentAnalysisRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeCorrelatedEnrichmentAnalysisAction::class,
                [
                    $params['dataset'],
                    $params['fragment'],
                    $params['subtypes'],
                    $params['sample_types'],
                    CorrelationMeasureEnum::from($params['measure']),
                    ComparisonExpressionTypeEnum::from($params['type']),
                    $params['covariates'],
                    (double)$params['correlation_threshold'],
                    FilterDirectionEnum::from($params['filter_direction']),
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
