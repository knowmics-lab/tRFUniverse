<?php

namespace App\Http\Controllers\Analysis\Correlation;

use App\Actions\BatchableAction;
use App\Actions\ComputeMostCorrelatedTableAction;
use App\Enums\ComparisonExpressionTypeEnum;
use App\Enums\CorrelationMeasureEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\MostCorrelatedTableRequest;

class MostCorrelatedTableController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\MostCorrelatedTableRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(MostCorrelatedTableRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeMostCorrelatedTableAction::class,
                [
                    $params['dataset'],
                    $params['fragment'] ?? null,
                    $params['gene'] ?? null,
                    $params['subtypes'],
                    $params['sample_types'],
                    CorrelationMeasureEnum::from($params['measure']),
                    ComparisonExpressionTypeEnum::from($params['type']),
                    $params['covariates'],
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
