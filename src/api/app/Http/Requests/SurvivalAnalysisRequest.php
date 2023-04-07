<?php

namespace App\Http\Requests;

use App\Enums\ExpressionTypeEnum;
use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SurvivalAnalysisRequest extends FormRequest
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
            'dataset'         => ['required', CommonRules::dataset(['NCI60'])],
            'metadata'        => ['required', CommonRules::metadataByCapability(Capabilities::SURVIVAL)],
            'type'            => ['required', new Enum(ExpressionTypeEnum::class)],
            'cutoff_high'     => ['numeric', 'min:0', 'max:1', 'gte:cutoff_low'],
            'cutoff_low'      => ['numeric', 'min:0', 'max:1', 'lte:cutoff_high'],
            'subtypes'        => ['array'],
            'subtypes.*'      => [CommonRules::subtype($dataset)],
            'sample_types'    => ['array'],
            'sample_types.*'  => [CommonRules::sampleType($dataset)],
            'covariates'      => ['array'],
            'covariates.*'    => [CommonRules::metadataByCapability(Capabilities::COVARIATE)],
            'left_censoring'  => ['nullable', 'numeric', 'min:0'],
            'right_censoring' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $isNotNormCounts = $this->input('type') !== ExpressionTypeEnum::NORM_COUNTS->value;

        $this->merge(
            [
                'cutoff_high'     => $this->input('cutoff_high', 0.5),
                'cutoff_low'      => $this->input('cutoff_low', 0.5),
                'fragment_id'     => $this->route('fragment', $this->input('fragment_id')),
                'subtypes'        => $this->input('subtypes', []),
                'sample_types'    => $this->input('sample_types', []),
                'covariates'      => $isNotNormCounts ? [] : $this->input('covariates', []),
                'left_censoring'  => $this->input('left_censoring', null),
                'right_censoring' => $this->input('right_censoring', null),
            ]
        );
    }
}
