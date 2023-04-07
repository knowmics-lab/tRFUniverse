<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\InvokableRule;

class SearchValueRule implements InvokableRule
{

    private const VALID_OPERATORS = [
        '=',
        '<',
        '>',
        '<=',
        '>=',
        '<>',
        '!=',
        '<=>',
    ];

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
        if (is_string($value) || is_numeric($value)) {
            return;
        }
        if (is_array($value) && count($value) === 2 && in_array($value[0], self::VALID_OPERATORS, true)) {
            return;
        }
        $fail('The :attribute must be a string, a number, or an array with a valid operator and a value.');
    }
}
