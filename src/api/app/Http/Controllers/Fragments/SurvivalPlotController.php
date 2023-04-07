<?php

namespace App\Http\Controllers\Fragments;

use App\Actions\BatchableAction;
use App\Actions\BuildSurvivalPlotAction;
use App\Enums\ExpressionTypeEnum;
use App\Enums\SurvivalMeasureEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\SurvivalAnalysisRequest;
use App\Models\Fragment;

class SurvivalPlotController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\SurvivalAnalysisRequest  $request
     * @param  \App\Models\Fragment  $fragment
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(SurvivalAnalysisRequest $request, Fragment $fragment): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                BuildSurvivalPlotAction::class,
                [
                    $params['dataset'],
                    $fragment,
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
            )->withOption('params', $params)->withOption('fragment', $fragment->id)->handle()
        );
    }
}
