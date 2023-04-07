<?php

namespace App\Http\Controllers\Traits;

use App\Models\FragmentType;
use App\Services\PaginatedQueryService;
use App\Services\PaginatedSearchService;

trait WithFragmentServiceColumns
{

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
                    'name'  => [
                        'type' => 'string',
                    ],
                    'width' => [
                        'type' => 'number',
                    ],
                    'type'  => [
                        'type'    => 'enum',
                        'options' => FragmentType::pluck('name')->toArray(),
                    ],
                ]
            )
            ->setSortableColumns(
                [
                    'name',
                    'width',
                    'type',
                ]
            );
    }

}