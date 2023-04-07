<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\BatchableAction;
use App\Actions\ComputeDimensionalityReductionAction;
use App\Enums\ColorMetadataEnum;
use App\Enums\DimensionalityReductionMethodEnum;
use App\Enums\FilteringFunctionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\DimensionalityReductionRequest;

class DimensionalityReductionAnalysisController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\DimensionalityReductionRequest  $request
     *
     * @return array
     * @throws \Throwable
     */
    public function __invoke(DimensionalityReductionRequest $request): array
    {
        $params = $request->validated();

        return $this->returnData(
            BatchableAction::make(
                ComputeDimensionalityReductionAction::class,
                [
                    (array)$params['datasets'],
                    array_filter(array_map(static fn($x) => ColorMetadataEnum::from($x), $params['color_by'])),
                    $params['scaling'],
                    DimensionalityReductionMethodEnum::from($params['method']),
                    $params['subtypes'],
                    $params['sample_types'],
                    $params['perplexity'],
                    $params['covariates'],
                    $params['filtering'],
                    $params['filtering_top'],
                    FilteringFunctionEnum::from($params['filtering_measure']),
                ]
            )->withOption('params', $params)->handle()
        );
    }
}
