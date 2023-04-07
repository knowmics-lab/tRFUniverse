<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Kirschbaum\PowerJoins\PowerJoins;
use Laravel\Scout\Searchable;

class Fragment extends Model
{

    use PowerJoins;
    use Searchable;

    protected $fillable = [
        'name',
        'width',
        'type',
    ];

    protected $casts = [
        'width' => 'integer',
    ];

    public function synonyms(): HasMany
    {
        return $this->hasMany(FragmentSynonym::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(FragmentPosition::class);
    }

    public function minExpressions(): HasMany
    {
        return $this->hasMany(CombinationFragmentMinValue::class, 'fragment_id');
    }

    public function toSearchableArray(): array
    {
        return [
            'name'     => $this->name,
            'synonyms' => $this->synonyms->pluck('synonym')->toArray(),
        ];
    }
}
