<?php

namespace App\Models;

use App\TrfExplorer\Constants;
use Illuminate\Database\Eloquent\Model;

class Sample extends Model
{

    public $timestamps = false;
    public $guarded = [];
    protected $casts = Constants::SAMPLES_CASTS;

//    public function expressions(): \Illuminate\Database\Eloquent\Relations\HasMany
//    {
//        return $this->hasMany(Expression::class);
//    }

}
