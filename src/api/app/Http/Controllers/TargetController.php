<?php

namespace App\Http\Controllers;

use App\Http\Requests\DataTableRequest;
use App\Http\Resources\TargetResource;
use App\Models\Fragment;
use App\Models\Target;
use App\Services\PaginatedQueryService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TargetController extends Controller
{

    public function index(DataTableRequest $request, ?Fragment $fragment = null): AnonymousResourceCollection
    {
        $query = Target::query()
                       ->joinRelationship('fragment')
                       ->with('fragment')
                       ->when(
                           $fragment !== null && $fragment->exists,
                           static fn($q) => $q->where('fragment_id', $fragment->id)
                       );

        return
            PaginatedQueryService::make(
                query:         $query,
                resourceClass: TargetResource::class,
                request:       $request
            )->setSearchableColumns(
                [
                    'fragments.name' => [
                        'type' => 'string',
                    ],
                    'gene_id'        => [
                        'type' => 'string',
                    ],
                    'gene_name'      => [
                        'type' => 'string',
                    ],
                ]
            )->setSearchableColumnAliases(
                [
                    'fragment_name' => 'fragments.name',
                ]
            )->setSortableColumns(
                [
                    'fragments.name',
                    'gene_id',
                    'gene_name',
                    'count',
                    'mfe',
                ]
            )->handle();
    }

    public function show(Target $target): TargetResource
    {
        return TargetResource::make(
            $target->load(['fragment', 'bindingSites', 'bindingSites.sources', 'expression'])
        );
    }

}
