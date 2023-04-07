<?php

namespace App\Http\Controllers\Fragments;

use App\Actions\BatchableAction;
use App\Actions\BuildExpressionPlotAction;
use App\Enums\ExpressionTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpressionPlotRequest;
use App\Models\Fragment;

class ExpressionPlotController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\ExpressionPlotRequest  $request
     * @param  \App\Models\Fragment  $fragment
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(ExpressionPlotRequest $request, Fragment $fragment): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                BuildExpressionPlotAction::class,
                [
                    $params['dataset'],
                    $fragment,
                    $params['metadata'],
                    ExpressionTypeEnum::from($params['type']),
                    $params['covariates'],
                ]
            )->withOption('params', $params)->withOption('fragment', $fragment->id)->handle()
        );
    }
}
