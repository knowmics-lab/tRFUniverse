<?php

namespace App\Http\Controllers\Fragments;

use App\Http\Controllers\Controller;
use App\Models\Fragment;

class FragmentIdentifierController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @return array
     */
    public function __invoke(): array
    {
        return [
            'data' => Fragment::pluck('id'),
        ];
    }
}
