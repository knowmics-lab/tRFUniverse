<?php

namespace App\Http\Controllers\Analysis\Differential;

use App\Actions\ComputeMetadataValuesAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\DifferentiallyExpressedAnalysisMetadataRequest;

class DifferentialExpressionAnalysisMetadataController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\DifferentiallyExpressedAnalysisMetadataRequest  $request
     *
     * @return array
     * @throws \App\Exceptions\ProcessingJobException
     * @throws \JsonException
     */
    public function __invoke(DifferentiallyExpressedAnalysisMetadataRequest $request
    ): array {
        $params = $request->validated();

        return $this->returnData(
            ComputeMetadataValuesAction::make($params['dataset'], $params['metadata'] ?? [])->handle()
        );
    }
}
