<?php

namespace App\Http\Requests;

use App\Rules\SearchValueRule;
use Illuminate\Foundation\Http\FormRequest;

class DataTableRequest extends FormRequest
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
            'page'     => ['required', 'integer', 'min:1'],
            'per_page' => ['required', 'integer', 'min:1'],
            'search'   => ['array'],
            'search.*' => [new SearchValueRule()],
            'sort'     => ['array'],
            'sort.*'   => ['in:asc,desc'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            [
                'page'     => $this->input('page', 1),
                'per_page' => $this->input('per_page', 15),
                'search'   => $this->input('search', []),
                'sort'     => $this->input('sort', []),
            ]
        );
    }
}
