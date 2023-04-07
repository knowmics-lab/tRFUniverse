<?php

namespace App\Http\Controllers;

use App\Enums\ComparisonExpressionTypeEnum;
use App\Http\Requests\DataTableRequest;
use App\Http\Requests\SearchGeneRequest;
use App\Http\Resources\GeneResource;
use App\Models\Fragment;
use App\Models\Gene;
use App\Services\PaginatedQueryService;
use App\Services\PaginatedSearchService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GeneController extends Controller
{

    public function index(DataTableRequest $request): AnonymousResourceCollection
    {
        return
            $this
                ->setServiceColumn(
                    PaginatedQueryService::make(
                        query:         Gene::query(),
                        resourceClass: GeneResource::class,
                        request:       $request
                    )
                )
                ->handle();
    }

    /**
     * @template T of \App\Services\PaginatedQueryService|\App\Services\PaginatedSearchService
     *
     * @param  T  $service
     *
     * @return T
     */
    protected function setServiceColumn(PaginatedQueryService|PaginatedSearchService $service)
    {
        return $service
            ->setSearchableColumns(
                [
                    'gene_id'      => [
                        'type' => 'string',
                    ],
                    'gene_name'    => [
                        'type' => 'string',
                    ],
                    'gene_type'    => [
                        'type' => 'string',
                    ],
                    'dataset_type' => [
                        'type'    => 'enum',
                        'options' => array_map(static fn($c) => $c->value, ComparisonExpressionTypeEnum::cases()),
                    ],
                ]
            )
            ->setSortableColumns(
                [
                    'gene_id',
                    'gene_name',
                    'gene_type',
                    'dataset_type',
                ]
            );
    }

    public function search(SearchGeneRequest $request): AnonymousResourceCollection
    {
        $query = $request->validated()['query'];

        return
            $this
                ->setServiceColumn(
                    PaginatedQueryService::make(
                        query:         Fragment::query()
                                               ->where(
                                                   static fn($q) => $q->where('gene_id', 'like', "%{$query}%")
                                                                      ->orWhere('gene_name', 'like', "%{$query}%")
                                               ),
                        resourceClass: GeneResource::class,
                        request:       $request
                    )
                )
                ->handle();
    }

}
