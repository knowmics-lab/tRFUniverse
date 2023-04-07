<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class SurvivalAnalysisWithFragmentRequest extends SurvivalAnalysisRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules() + [
                'fragment_name' => Rule::when(
                    $this->input('fragment_id') === null,
                    ['required', 'string', 'max:255']
                ),
                'fragment_id'   => Rule::when(
                    $this->input('fragment_name') === null,
                    ['required_without:fragment_name', 'integer', 'exists:fragments,id']
                ),
            ];
    }
}
