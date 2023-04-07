<?php

namespace App\Rules;

use App\Models\Combination;
use Exception;
use Illuminate\Contracts\Validation\InvokableRule;

class SearchFilterRule implements InvokableRule
{
    /**
     * Run the validation rule.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     *
     * @return void
     */
    public function __invoke($attribute, $value, $fail): void
    {
        if (empty($value)) {
            $fail('This filter is empty.');

            return;
        }
        if (!isset($value['field'])) {
            $fail('This filter is missing the field.');

            return;
        }
        if (!isset($value['value'])) {
            $fail('This filter is missing the value.');

            return;
        }
        ['field' => $filterField, 'value' => $filterValue] = $value;
        try {
            $query = Combination::query();
            if ($filterValue === null || strtolower($filterValue) === 'na') {
                $query->whereNull($filterField);
            } else {
                $query->whereNotNull($filterField)
                      ->where($filterField, $filterValue);
            }
            if ($query->count() === 0) {
                $fail('This value is invalid.');
            }
        } catch (Exception) {
            $fail('This field is invalid.');
        }
    }
}
