<?php

namespace App\Http\Requests;

class SearchGeneRequest extends DataTableRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules() + [
                'query' => ['required', 'string'],
            ];
    }
}
