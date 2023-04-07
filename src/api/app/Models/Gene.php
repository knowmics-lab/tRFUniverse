<?php

namespace App\Models;

use App\Enums\ComparisonExpressionTypeEnum;
use Illuminate\Database\Eloquent\Model;

class Gene extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'gene_id',
        'gene_name',
        'gene_type',
        'dataset_type',
    ];
    protected $casts = [
        'dataset_type' => ComparisonExpressionTypeEnum::class,
    ];

}
