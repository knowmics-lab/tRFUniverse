<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Kirschbaum\PowerJoins\PowerJoins;

class TargetSample extends Model
{
    use PowerJoins;

    public $timestamps = false;
    protected $fillable = [
        'dataset',
        'sample',
        'type',
        'cell_line',
        'ago',
    ];

}
