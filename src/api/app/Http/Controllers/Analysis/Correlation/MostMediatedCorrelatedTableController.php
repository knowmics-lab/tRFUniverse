<?php

namespace App\Http\Controllers\Analysis\Correlation;

use App\Actions\BatchableAction;
use App\Actions\ComputeMostMediatedCorrelatedTableAction;
use App\Enums\ComparisonExpressionTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\MostMediatedCorrelatedTableRequest;

class MostMediatedCorrelatedTableController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\MostMediatedCorrelatedTableRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(MostMediatedCorrelatedTableRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeMostMediatedCorrelatedTableAction::class,
                [
                    $params['dataset'],
                    $params['fragment'] ?? null,
                    $params['gene'] ?? null,
                    $params['metadata'],
                    $params['subtypes'],
                    $params['sample_types'],
                    ComparisonExpressionTypeEnum::from($params['type']),
                    $params['covariates'],
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
