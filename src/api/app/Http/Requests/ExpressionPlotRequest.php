<?php

namespace App\Http\Requests;

use App\Enums\ExpressionTypeEnum;
use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class ExpressionPlotRequest extends FormRequest
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
            'dataset'      => ['required', CommonRules::dataset()],
            'metadata'     => [
                'required',
                CommonRules::metadataByCapability(Capabilities::EXPRESSION_GRAPHS),
            ],
            'type'         => ['required', new Enum(ExpressionTypeEnum::class)],
            'covariates'   => ['array'],
            'covariates.*' => [Rule::exists('metadata', 'name')],
        ];
    }

    protected function prepareForValidation(): void
    {
        $isNotNormCounts = $this->input('type') !== ExpressionTypeEnum::NORM_COUNTS->value;

        $this->merge(
            [
                'covariates' => $isNotNormCounts ? [] : $this->input('covariates', []),
            ]
        );
    }
}
