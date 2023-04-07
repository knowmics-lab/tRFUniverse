<?php

namespace App\Services;

use App\Http\Requests\DataTableRequest;
use App\Traits\Makeable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginatedQueryService
{

    use Makeable;

    protected int $page;
    protected int $perPage;
    protected array $searchableColumns = [];
    protected array $sortableColumns = [];
    protected array $searchableColumnAliases = [];

    /**
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  class-string<\Illuminate\Http\Resources\Json\JsonResource>  $resourceClass
     * @param  \App\Http\Requests\DataTableRequest  $request
     */
    public function __construct(
        protected readonly Builder $query,
        protected readonly string $resourceClass,
        protected readonly DataTableRequest $request
    ) {}

    public function setSearchableColumns(array $columns): self
    {
        $this->searchableColumns = $columns;

        return $this;
    }

    public function setSearchableColumnAliases(array $aliases): self
    {
        $this->searchableColumnAliases = $aliases;

        return $this;
    }

    public function setSortableColumns(array $columns): self
    {
        $this->sortableColumns = $columns;

        return $this;
    }

    public function handle(): AnonymousResourceCollection
    {
        $this->handleRequest();

        $paginatedResults =
            $this->query
                ->cachedPaginate($this->perPage, ['*'], 'page', $this->page)
                ->withQueryString();

        return call_user_func([$this->resourceClass, 'collection'], $paginatedResults);
    }

    protected function handleRequest(): void
    {
        $validated = $this->request->validated();
        $this->page = $validated['page'];
        $this->perPage = $validated['per_page'];
        $this->handleSearch();
        $this->handleSorting();
    }

    protected function handleSearch(): void
    {
        $search = $this->request->validated()['search'];
        foreach ($search as $key => $value) {
            if (isset($this->searchableColumnAliases[$key])) {
                $key = $this->searchableColumnAliases[$key];
            }
            if (!isset($this->searchableColumns[$key])) {
                continue;
            }
            if ($this->searchableColumns[$key]['type'] === 'string') {
                $this->query->where($key, 'like', "%{$value}%");
            } elseif ($this->searchableColumns[$key]['type'] === 'number') {
                $operator = '=';
                if (is_array($value) && count($value) === 2) {
                    [$operator, $value] = $value;
                }
                $this->query->where($key, $operator, $value);
            } elseif ($this->searchableColumns[$key]['type'] === 'enum') {
                if (in_array($value, $this->searchableColumns[$key]['options'], true)) {
                    $this->query->where($key, $value);
                }
            }
        }
    }

    protected function handleSorting(): void
    {
        $sort = $this->request->validated()['sort'];
        foreach ($sort as $key => $value) {
            if (!in_array($key, $this->sortableColumns, true)) {
                continue;
            }
            $this->query->orderBy($key, $value);
        }
    }

}