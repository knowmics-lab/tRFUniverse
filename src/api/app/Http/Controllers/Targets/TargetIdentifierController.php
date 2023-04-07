<?php

namespace App\Http\Controllers\Targets;

use App\Http\Controllers\Controller;
use App\Models\Target;

class TargetIdentifierController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @return array
     */
    public function __invoke(): array
    {
        return [
            'data' => Target::pluck('id'),
        ];
    }
}
