<?php

namespace App\Models;

use App\Enums\TargetAlgorithmEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Kirschbaum\PowerJoins\PowerJoins;

class TargetBindingSiteSource extends Model
{
    use PowerJoins;

    protected $with = ['sample'];

    public $timestamps = false;
    protected $fillable = [
        'target_binding_site_id',
        'sample_id',
        'algorithm',
        'target_sequence',
        'fragment_sequence',
        'mfe',
    ];

    protected $casts = [
        'algorithm' => TargetAlgorithmEnum::class,
        'mfe'       => 'float',
    ];

    public function bindingSite(): BelongsTo
    {
        return $this->belongsTo(Target::class, 'target_binding_site_id');
    }

    public function sample(): BelongsTo
    {
        return $this->belongsTo(TargetSample::class, 'sample_id');
    }
}
