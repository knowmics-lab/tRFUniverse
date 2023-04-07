<?php

namespace App\Http\Requests;

use App\Models\Aminoacid;
use App\Models\Anticodon;
use App\Models\FragmentType;
use App\Rules\CommonRules;
use App\Rules\SearchFilterRule;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Validation\Rule;

class SearchFragmentRequest extends DataTableRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules() + [
                'fragment_type'   => ['nullable', Rule::in(FragmentType::pluck('name')->push('all'))],
                'aminoacid'       => ['nullable', Rule::in(Aminoacid::pluck('name')->push('all'))],
                'anticodon'       => ['nullable', Rule::in(Anticodon::pluck('name')->push('all'))],
                'filters'         => ['array'],
                'filters.*'       => ['array', new SearchFilterRule()],
                'filters.*.field' => ['required', CommonRules::metadataByCapability(Capabilities::SEARCH)],
                'filters.*.value' => ['present', 'nullable', 'string'],
                'min_rpm'         => ['numeric', 'min:0'],
            ];
    }

    public function messages(): array
    {
        return [
            'filters.*.field.required' => 'A filter field must be specified.',
            'filters.*.field.exists'   => 'This filter field is not searchable.',
            'filters.*.value.present'  => 'A filter value must be always present.',
            'filters.*.value.string'   => 'A filter value should be a string or null.',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge(
            [
                'min_rpm' => $this->input('min_rpm', 1.0),
                'filters' => $this->input('filters', []),
            ]
        );
    }

}
