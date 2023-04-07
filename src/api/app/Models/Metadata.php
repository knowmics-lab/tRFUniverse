<?php

namespace App\Models;

use App\Enums\MetadataTypeEnum;
use App\TrfExplorer\Constants\Capabilities;
use Closure;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder as QueryBuilder;

class Metadata extends Model
{

    public $timestamps = false;

    protected $fillable = [
        'name',
        'display_name',
        'type',
        'capabilities',
        'values',
        'values_by_dataset',
        'options',
    ];

    protected $casts = [
        'type'              => MetadataTypeEnum::class,
        'capabilities'      => 'json',
        'values'            => 'json',
        'values_by_dataset' => 'json',
        'options'           => 'json',
    ];

    public function scopeDataset(EloquentBuilder $query): EloquentBuilder
    {
        return $this->scopeCapability($query, Capabilities::DATASET);
    }

    public function scopeCapability(EloquentBuilder $query, string $capability): EloquentBuilder
    {
        return self::capabilityWhere($capability)($query);
    }

    /**
     * @param  string  $capability
     *
     * @return \Closure
     */
    public static function capabilityWhere(string $capability): Closure
    {
        return static fn(EloquentBuilder|QueryBuilder $q) => $q->whereJsonContains(
            'capabilities->'.$capability,
            true
        );
    }

    public function scopeSampleType(EloquentBuilder $query): EloquentBuilder
    {
        return $this->scopeCapability($query, Capabilities::SAMPLE_TYPE);
    }

    public function scopeSubtype(EloquentBuilder $query): EloquentBuilder
    {
        return $this->scopeCapability($query, Capabilities::SUBTYPE);
    }

    public function scopeSurvival(EloquentBuilder $query): EloquentBuilder
    {
        return $this->scopeCapability($query, Capabilities::SURVIVAL);
    }

    public function can(string $capability): bool
    {
        return $this->capabilities[$capability] ?? false;
    }

}
