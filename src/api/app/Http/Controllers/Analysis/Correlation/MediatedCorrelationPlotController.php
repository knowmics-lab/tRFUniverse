<?php

namespace App\Http\Controllers\Analysis\Correlation;

use App\Actions\BatchableAction;
use App\Actions\ComputeMediatedCorrelationPlotAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\MediatedCorrelationPlotRequest;

class MediatedCorrelationPlotController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\MediatedCorrelationPlotRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(MediatedCorrelationPlotRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeMediatedCorrelationPlotAction::class,
                [
                    $params['dataset'],
                    $params['fragment'],
                    $params['gene'],
                    $params['metadata'],
                    $params['subtypes'],
                    $params['sample_types'],
                    $params['covariates'],
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
