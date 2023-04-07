<?php

namespace App\Http\Requests;

use App\Rules\CommonRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class PHENSIMAnalysisRequest extends FormRequest
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
            'reactome'    => ['boolean'],
            'epsilon'     => ['numeric', 'min:0', 'max:1'],
            'seed'        => ['integer'],
            'notify_to'   => ['nullable', 'email'],
            'notify_url'  => ['nullable', 'active_url'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Check if notify_url is a valid URL and starts with the frontend URL
        // I don't want to throw a validation error, for security reasons.
        $notifyUrl = $this->input('notify_url');
        if (!Str::startsWith($notifyUrl, config('trfuniverse.frontend'))) {
            $notifyUrl = null;
        }
        $this->merge(
            [
                'evidences'  => $this->input('evidences'),
                'dataset'    => $this->input('dataset'),
                'pvalue'     => $this->input('pvalue', 0.05),
                'reactome'   => $this->input('reactome', true),
                'epsilon'    => $this->input('epsilon', 0.0000001),
                'seed'       => $this->input('seed', 1234),
                'notify_to'  => $this->input('notify_to'),
                'notify_url' => $notifyUrl,
            ]
        );
    }
}
