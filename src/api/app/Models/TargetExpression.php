<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Kirschbaum\PowerJoins\PowerJoins;

class TargetExpression extends Model
{
    use PowerJoins;

    public $timestamps = false;
    protected $fillable = [
        'target_id',
        'expressions',
    ];

    protected $casts = [
        'expressions' => 'json',
    ];

    public function target(): BelongsTo
    {
        return $this->belongsTo(Target::class);
    }
}
