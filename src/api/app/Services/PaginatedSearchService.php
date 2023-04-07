<?php

namespace App\Services;

use App\Http\Requests\SearchFragmentRequest;
use App\Http\Resources\FragmentResource;
use App\Models\Combination;
use App\Models\Fragment;
use App\Traits\Makeable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginatedSearchService
{

    use Makeable;

    protected array $searchableColumns = [];
    protected array $sortableColumns = [];
    protected ?string $fragmentType = null;
    protected ?string $aminoacid = null;
    protected ?string $anticodon = null;
    protected ?float $minRpm = null;
    protected array $filters = [];
    protected SearchFragmentRequest $request;

    public function __construct(SearchFragmentRequest $request)
    {
        $this->request = $request;
        $validated = $request->validated();
        $this->fragmentType = self::validated($validated, 'fragment_type');
        $this->aminoacid = self::validated($validated, 'aminoacid');
        $this->anticodon = self::validated($validated, 'anticodon');
        $this->minRpm = (double)$validated['min_rpm'];
        $this->filters = array_filter($validated['filters']);
    }

    protected static function validated(array $validated, string $key, mixed $default = null): mixed
    {
        $value = $validated[$key] ?? $default;

        return ($value === 'all') ? null : $value;
    }

    public function handle(): AnonymousResourceCollection
    {
        $query = $this->handleRPMFilters($this->handleBasicFilters(Fragment::query()));
        $svc = PaginatedQueryService::make(
            query:         $query,
            resourceClass: FragmentResource::class,
            request:       $this->request
        );

        return $svc->setSearchableColumns($this->searchableColumns)
                   ->setSortableColumns($this->sortableColumns)
                   ->handle();
    }

    public function setSortableColumns(array $columns): self
    {
        $this->sortableColumns = $columns;

        return $this;
    }

    public function setSearchableColumns(array $columns): self
    {
        $this->searchableColumns = $columns;

        return $this;
    }

    protected function handleRPMFilters(Builder $fragmentsQuery): Builder
    {
        if ($this->minRpm !== 0.0) {
            $combinationsQuery = Combination::query()
                                            ->joinRelationship('minValues')
                                            ->where('combination_fragment_min_values.value', '>=', $this->minRpm)
                                            ->select('combination_fragment_min_values.fragment_id')
                                            ->distinct();
            if (count($this->filters) > 0) {
                foreach ($this->filters as $filter) {
                    $field = 'combinations.'.$filter['field'];
                    $value = $filter['value'];
                    if ($value === 'all') {
                        continue;
                    }
                    if ($value === null || strtolower($value) === 'na') {
                        $combinationsQuery->whereNull($field);
                    } else {
                        $combinationsQuery->whereNotNull($field)
                                          ->where($field, $value);
                    }
                }
            }
            $fragmentsQuery->whereIn(
                'id',
                $combinationsQuery
            );
        }

        return $fragmentsQuery;
    }

    protected function handleBasicFilters(Builder $fragmentsQuery): Builder
    {
        if ($this->fragmentType !== null) {
            $fragmentsQuery->where('type', $this->fragmentType);
        }
        if ($this->aminoacid !== null || $this->anticodon !== null) {
            $fragmentsQuery->whereHas(
                'positions',
                function ($query) {
                    if ($this->aminoacid !== null) {
                        $query->where('aminoacid', $this->aminoacid);
                    }
                    if ($this->anticodon !== null) {
                        $query->where('anticodon', $this->anticodon);
                    }
                }
            );
        }

        return $fragmentsQuery;
    }

}