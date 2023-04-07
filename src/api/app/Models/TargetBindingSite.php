<?php

namespace App\Models;

use App\Enums\TargetPositionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Kirschbaum\PowerJoins\PowerJoins;

class TargetBindingSite extends Model
{
    use PowerJoins;

    public $timestamps = false;
    protected $fillable = [
        'target_id',
        'transcript_id',
        'transcript_name',
        'position',
        'start',
        'end',
        'mfe',
        'count',
    ];

    protected $casts = [
        'position' => TargetPositionEnum::class,
        'start'    => 'integer',
        'end'      => 'integer',
        'mfe'      => 'float',
        'count'    => 'integer',
    ];

    public function target(): BelongsTo
    {
        return $this->belongsTo(Target::class);
    }

    public function sources(): HasMany
    {
        return $this->hasMany(TargetBindingSiteSource::class, 'target_binding_site_id');
    }
}
