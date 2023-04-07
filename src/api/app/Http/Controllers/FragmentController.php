<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\WithFragmentServiceColumns;
use App\Http\Requests\DataTableRequest;
use App\Http\Resources\FragmentResource;
use App\Http\Resources\ShowFragmentResource;
use App\Models\Fragment;
use App\Services\PaginatedQueryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FragmentController extends Controller
{

    use WithFragmentServiceColumns;

    public function index(DataTableRequest $request): AnonymousResourceCollection
    {
        return
            $this->setServiceColumn(
                PaginatedQueryService::make(
                    query:         Fragment::query()->select(['id', 'name', 'width', 'type']),
                    resourceClass: FragmentResource::class,
                    request:       $request
                )
            )->handle();
    }

    public function show(Fragment $fragment): ShowFragmentResource
    {
        return ShowFragmentResource::make($fragment->load(['positions', 'synonyms']));
    }

}
