<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aminoacid extends Model
{

    public $timestamps = false;
    protected $fillable = [
        'name',
    ];

}
