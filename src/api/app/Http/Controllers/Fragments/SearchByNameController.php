<?php

namespace App\Http\Controllers\Fragments;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\WithFragmentServiceColumns;
use App\Http\Requests\SearchFragmentByNameRequest;
use App\Http\Resources\FragmentResource;
use App\Models\Fragment;
use App\Services\PaginatedQueryService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SearchByNameController extends Controller
{

    use WithFragmentServiceColumns;

    /**
     * Handle the incoming request.
     *
     * @param  \App\Http\Requests\SearchFragmentByNameRequest  $request
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function __invoke(SearchFragmentByNameRequest $request): AnonymousResourceCollection
    {
        $query = $request->validated()['query'];

        return
            $this->setServiceColumn(
                PaginatedQueryService::make(
                    query:         Fragment::query()
                                           ->where(
                                               static fn($q) => $q->where('name', 'like', "%{$query}%")
                                                                  ->orWhereHas(
                                                                      'synonyms',
                                                                      static fn($qs) => $qs->where(
                                                                          'synonym',
                                                                          'like',
                                                                          "%{$query}%"
                                                                      )
                                                                  )
                                           )
                                           ->select(['id', 'name', 'width', 'type']),
                    resourceClass: FragmentResource::class,
                    request:       $request
                )
            )->handle();
    }
}
