<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Kirschbaum\PowerJoins\PowerJoins;

class Target extends Model
{
    use PowerJoins;

    public $timestamps = false;
    protected $fillable = [
        'fragment_id',
        'gene_id',
        'gene_name',
        'mfe',
        'count',
    ];

    protected $casts = [
        'mfe'   => 'float',
        'count' => 'integer',
    ];

    public function fragment(): BelongsTo
    {
        return $this->belongsTo(Fragment::class);
    }

    public function expression(): HasOne
    {
        return $this->hasOne(TargetExpression::class);
    }

    public function bindingSites(): HasMany
    {
        return $this->hasMany(TargetBindingSite::class);
    }

    public function sources(): HasManyThrough
    {
        return $this->hasManyThrough(
            TargetBindingSiteSource::class,
            TargetBindingSite::class,
            'target_id',
            'target_binding_site_id'
        );
    }
}
