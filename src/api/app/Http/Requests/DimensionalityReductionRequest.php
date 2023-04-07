<?php

namespace App\Http\Requests;

use App\Enums\ColorMetadataEnum;
use App\Enums\DimensionalityReductionMethodEnum;
use App\Enums\FilteringFunctionEnum;
use App\Models\Metadata;
use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class DimensionalityReductionRequest extends FormRequest
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
        $inputDatasets = (array)$this->input('datasets', []);
        $subTypes = $this->uniqueByDatasets(
            Metadata::subtype()->first('values_by_dataset')->values_by_dataset,
            $inputDatasets
        );
        $sampleTypes = $this->uniqueByDatasets(
            Metadata::sampleType()->first('values_by_dataset')->values_by_dataset,
            $inputDatasets
        );

        return [
            'datasets'          => ['required', 'array'],
            'datasets.*'        => [CommonRules::dataset()],
            'color_by'          => ['array'],
            'color_by.*'        => [CommonRules::metadataByCapability(Capabilities::COLORABLE)],
            'scaling'           => ['boolean'],
            'method'            => [new Enum(DimensionalityReductionMethodEnum::class)],
            'perplexity'        => ['numeric'],
            'subtypes'          => ['array'],
            'subtypes.*'        => [Rule::in($subTypes)],
            'sample_types'      => ['array'],
            'sample_types.*'    => [Rule::in($sampleTypes)],
            'covariates'        => ['array'],
            'covariates.*'      => [CommonRules::metadataByCapability(Capabilities::COVARIATE)],
            'filtering'         => ['boolean'],
            'filtering_top'     => ['integer'],
            'filtering_measure' => [new Enum(FilteringFunctionEnum::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            [
                'color_by'          => $this->input('color_by', [ColorMetadataEnum::DATASET->value]),
                'scaling'           => $this->boolean('scaling'),
                'method'            => $this->input('method', DimensionalityReductionMethodEnum::PCA->value),
                'subtypes'          => $this->input('subtypes', []),
                'sample_types'      => $this->input('sample_types', []),
                'perplexity'        => $this->input('perplexity', 30),
                'covariates'        => $this->input('covariates', []),
                'filtering'         => $this->boolean('filtering'),
                'filtering_top'     => $this->input('filtering_top', 100),
                'filtering_measure' => $this->input('filtering_measure', FilteringFunctionEnum::MAD->value),
            ]
        );
    }

    protected function uniqueByDatasets(array $valuesByDataset, array $datasets): array
    {
        return collect($valuesByDataset)
            ->filter(static fn($v, $k) => in_array($k, $datasets, true))
            ->map(static fn($v) => array_keys($v))
            ->flatten()->unique()->toArray();
    }
}
