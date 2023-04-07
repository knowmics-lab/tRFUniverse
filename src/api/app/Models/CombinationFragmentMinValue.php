<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Kirschbaum\PowerJoins\PowerJoins;

class CombinationFragmentMinValue extends Model
{
    use PowerJoins;

    public $timestamps = false;
    protected $fillable = [
        'combination_id',
        'fragment_id',
        'value',
    ];
    protected $casts = [
        'value' => 'float',
    ];

    public function combination(): BelongsTo
    {
        return $this->belongsTo(Combination::class);
    }

    public function fragment(): BelongsTo
    {
        return $this->belongsTo(Fragment::class);
    }
}
