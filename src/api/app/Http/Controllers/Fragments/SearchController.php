<?php

namespace App\Http\Controllers\Fragments;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\WithFragmentServiceColumns;
use App\Http\Requests\SearchFragmentRequest;
use App\Services\PaginatedSearchService;

class SearchController extends Controller
{
    use WithFragmentServiceColumns;

    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\SearchFragmentRequest  $request
     *
     * @return \Illuminate\Http\Response
     */
    public function __invoke(SearchFragmentRequest $request)
    {
        return
            $this->setServiceColumn(
                PaginatedSearchService::make(
                    request: $request
                )
            )->handle();
    }
}
