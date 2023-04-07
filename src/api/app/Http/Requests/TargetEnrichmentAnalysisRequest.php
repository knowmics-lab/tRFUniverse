<?php

namespace App\Http\Requests;

use App\Rules\CommonRules;
use Illuminate\Foundation\Http\FormRequest;

class TargetEnrichmentAnalysisRequest extends FormRequest
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
        return [
            'evidences'   => ['nullable', 'array'],
            'evidences.*' => ['required', 'string'],
            'dataset'     => ['nullable', CommonRules::dataset(include: ['global'])],
            'pvalue'      => ['numeric', 'min:0', 'max:1'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            [
                'evidences' => $this->input('evidences'),
                'dataset'   => $this->input('dataset'),
                'pvalue'    => $this->input('pvalue', 0.05),
            ]
        );
    }
}
