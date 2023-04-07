<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\BatchableAction;
use App\Actions\BuildSurvivalPlotAction;
use App\Enums\ExpressionTypeEnum;
use App\Enums\SurvivalMeasureEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\SurvivalAnalysisWithFragmentRequest;
use App\Models\Fragment;

class SurvivalAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\SurvivalAnalysisWithFragmentRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(SurvivalAnalysisWithFragmentRequest $request): array
    {
        $params = $request->validated();

        $fragment = (isset($params['fragment_id'])) ? Fragment::find($params['fragment_id']) : Fragment::where(
            'name',
            $params['fragment_name']
        )->first();
        if (!$fragment) {
            abort(404, 'Fragment not found');
        }

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
            )->withOption('params', $params)->handle()
        );
    }
}
