<?php

namespace App\Http\Requests;

use App\Enums\ComparisonExpressionTypeEnum;
use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class MostMediatedCorrelatedTableRequest extends FormRequest
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
            'dataset'        => ['required', CommonRules::dataset()],
            'fragment'       => ['required_without:gene', 'prohibits:gene', Rule::exists('fragments', 'name')],
            'gene'           => ['required_without:fragment', 'prohibits:fragment', Rule::exists('genes', 'gene_name')],
            'metadata'       => ['required', CommonRules::metadataByCapability(Capabilities::MEDIATED_CORRELATION)],
            'type'           => ['required_without:gene', new Enum(ComparisonExpressionTypeEnum::class)],
            'subtypes'       => ['array'],
            'subtypes.*'     => [CommonRules::subtype($dataset)],
            'sample_types'   => ['array'],
            'sample_types.*' => [CommonRules::sampleType($dataset)],
            'covariates'     => ['array'],
            'covariates.*'   => [CommonRules::metadataByCapability(Capabilities::COVARIATE)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            [
                'subtypes'     => $this->input('subtypes', []),
                'sample_types' => $this->input('sample_types', []),
                'covariates'   => $this->input('covariates', []),
            ]
        );
    }
}
