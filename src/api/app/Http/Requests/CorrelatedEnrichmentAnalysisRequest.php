<?php

namespace App\Http\Requests;

use App\Enums\ComparisonExpressionTypeEnum;
use App\Enums\CorrelationMeasureEnum;
use App\Enums\FilterDirectionEnum;
use App\Rules\CommonRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CorrelatedEnrichmentAnalysisRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $dataset = $this->input('dataset');

        return [
            'dataset'               => ['required', CommonRules::dataset()],
            'fragment'              => ['required', Rule::exists('fragments', 'name')],
            'subtypes'              => ['array'],
            'subtypes.*'            => [CommonRules::subtype($dataset)],
            'sample_types'          => ['array'],
            'sample_types.*'        => [CommonRules::sampleType($dataset)],
            'type'                  => [new Enum(ComparisonExpressionTypeEnum::class)],
            'measure'               => [new Enum(CorrelationMeasureEnum::class)],
            'covariates'            => ['array'],
            'covariates.*'          => [Rule::exists('metadata', 'name')],
            'correlation_threshold' => ['numeric', 'min:0', 'max:1'],
            'filter_direction'      => [new Enum(FilterDirectionEnum::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            [
                'subtypes'              => $this->input('subtypes', []),
                'sample_types'          => $this->input('sample_types', []),
                'covariates'            => $this->input('covariates', []),
                'measure'               => $this->input('measure', CorrelationMeasureEnum::PEARSON->value),
                'type'                  => $this->input('type', ComparisonExpressionTypeEnum::GENES->value),
                'correlation_threshold' => $this->input('correlation_threshold', 0.5),
                'filter_direction'      => $this->input('filter_direction', FilterDirectionEnum::BOTH->value),
            ]
        );
    }
}
