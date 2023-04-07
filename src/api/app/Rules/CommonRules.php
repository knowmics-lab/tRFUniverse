<?php

namespace App\Rules;

use App\Models\Metadata;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists as ExistsRule;
use Illuminate\Validation\Rules\In as InRule;

class CommonRules
{

    public static function dataset(array $exclude = [], array $include = []): InRule
    {
        $datasets = array_keys(Metadata::dataset()->first('values')->values);
        if (!empty($exclude)) {
            $datasets = array_diff($datasets, $exclude);
        }
        if (!empty($include)) {
            $datasets = [...$datasets, ...$include];
        }

        return Rule::in($datasets);
    }

    public static function metadataByCapability(string $capability): ExistsRule
    {
        return Rule::exists('metadata', 'name')->where(Metadata::capabilityWhere($capability));
    }

    public static function subtype(?string $dataset): InRule
    {
        $values = Metadata::subtype()->first('values_by_dataset')->values_by_dataset;

        return Rule::in(array_keys($values[$dataset] ?? []));
    }

    public static function sampleType(?string $dataset): InRule
    {
        $values = Metadata::sampleType()->first('values_by_dataset')->values_by_dataset;

        return Rule::in(array_keys($values[$dataset] ?? []));
    }
}