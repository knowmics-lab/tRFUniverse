<?php

namespace App\Http\Controllers\Analysis\Correlation;

use App\Actions\BatchableAction;
use App\Actions\ComputeCorrelationPlotAction;
use App\Enums\CorrelationMeasureEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\CorrelationPlotRequest;

class CorrelationPlotController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\CorrelationPlotRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(CorrelationPlotRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeCorrelationPlotAction::class,
                [
                    $params['dataset'],
                    $params['fragment'],
                    $params['gene'],
                    $params['subtypes'],
                    $params['sample_types'],
                    CorrelationMeasureEnum::from($params['measure']),
                    $params['covariates'],
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
