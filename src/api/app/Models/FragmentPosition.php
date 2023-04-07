<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FragmentPosition extends Model
{

    protected $fillable = [
        'fragment_id',
        'chromosome',
        'start',
        'end',
        'strand',
        'aminoacid',
        'anticodon',
    ];

    protected $casts = [
        'start' => 'integer',
        'end'   => 'integer',
        'width' => 'integer',
    ];

    public function fragment(): BelongsTo
    {
        return $this->belongsTo(Fragment::class);
    }

}
