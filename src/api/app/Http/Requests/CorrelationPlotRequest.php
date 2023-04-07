<?php

namespace App\Http\Requests;

use App\Enums\CorrelationMeasureEnum;
use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CorrelationPlotRequest extends FormRequest
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
            'fragment'       => ['required', Rule::exists('fragments', 'name')],
            'gene'           => ['required', Rule::exists('genes', 'gene_name')],
            'subtypes'       => ['array'],
            'subtypes.*'     => [CommonRules::subtype($dataset)],
            'sample_types'   => ['array'],
            'sample_types.*' => [CommonRules::sampleType($dataset)],
            'measure'        => [new Enum(CorrelationMeasureEnum::class)],
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
                'measure'      => $this->input('measure', CorrelationMeasureEnum::PEARSON->value),
            ]
        );
    }

}
