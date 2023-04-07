<?php

namespace App\Http\Requests;

use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property mixed $metadata
 * @property mixed $dataset
 */
class DifferentiallyExpressedAnalysisMetadataRequest extends FormRequest
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
            'dataset'    => ['required', CommonRules::dataset()],
            'metadata'   => ['required', 'array'],
            'metadata.*' => ['required', CommonRules::metadataByCapability(Capabilities::DEGS)],
        ];
    }
}
