<?php

namespace App\Http\Controllers\Analysis\Differential;

use App\Actions\BatchableAction;
use App\Actions\ComputeDifferentialSurvivalFragmentsAction;
use App\Enums\ExpressionTypeEnum;
use App\Enums\SurvivalMeasureEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\SurvivalAnalysisRequest;

class DifferentialSurvivalAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\SurvivalAnalysisRequest  $request
     *
     * @return array
     * @throws \App\Exceptions\ProcessingJobException
     * @throws \Throwable
     */
    public function __invoke(SurvivalAnalysisRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeDifferentialSurvivalFragmentsAction::class,
                [
                    $params['dataset'],
                    SurvivalMeasureEnum::from($params['metadata']),
                    ExpressionTypeEnum::from($params['type']),
                    $params['cutoff_high'],
                    $params['cutoff_low'],
                    $params['subtypes'],
                    $params['sample_types'],
                    $params['covariates'],
                    $params['left_censoring'],
                    $params['right_censoring'],
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
