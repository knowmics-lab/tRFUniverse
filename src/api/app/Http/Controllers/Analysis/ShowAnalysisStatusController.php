<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\BatchableAction;
use App\Http\Controllers\Controller;

class ShowAnalysisStatusController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  string  $analysisId
     *
     * @return array
     */
    public function __invoke(string $analysisId): array
    {
        return $this->returnData(BatchableAction::statusArrayFromBatch($analysisId));
    }
}
