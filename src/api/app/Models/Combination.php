<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Kirschbaum\PowerJoins\PowerJoins;

class Combination extends Model
{
    use PowerJoins;

    public $timestamps = false;
    public $guarded = [];

    public function minValues(): HasMany
    {
        return $this->hasMany(CombinationFragmentMinValue::class);
    }

}
