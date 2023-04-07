<?php

namespace App\Http\Controllers\Analysis\PHENSIM;

use App\Http\Controllers\Controller;
use App\Jobs\PHENSIMCallbackJob;
use Illuminate\Http\Request;


class PHENSIMCallbackController extends Controller
{

    public function __invoke(Request $request, string $analysisId)
    {
        if (!$request->hasValidSignature(false)) {
            abort(401, 'Invalid signature');
        }
        $phensimId = (int)$request->input('id');
        $status = strtolower($request->input('status'));
        $logs = $request->input('logs');
        PHENSIMCallbackJob::dispatch($analysisId, $phensimId, $status, $logs);

        return response()->noContent();
    }
}
