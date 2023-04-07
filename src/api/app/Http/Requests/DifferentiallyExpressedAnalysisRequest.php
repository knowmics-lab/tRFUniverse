<?php

namespace App\Http\Requests;

use App\Actions\ComputeMetadataValuesAction;
use App\Rules\CommonRules;
use App\TrfExplorer\Constants\Capabilities;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

/**
 * @property mixed $metadata
 * @property mixed $dataset
 */
class DifferentiallyExpressedAnalysisRequest extends FormRequest
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
        $metadataValues = $this->buildAvailableContrastsValues();

        return [
            'dataset'                => ['required', CommonRules::dataset()],
            'metadata'               => ['required', 'array'],
            'metadata.*'             => ['required', CommonRules::metadataByCapability(Capabilities::DEGS)],
            'contrasts'              => ['required', 'array'],
            'contrasts.*'            => ['array'],
            'contrasts.*.case'       => ['required', 'array'],
            'contrasts.*.case.*'     => ['required', Rule::in($metadataValues)],
            'contrasts.*.control'    => ['required', 'array'],
            'contrasts.*.control.*'  => ['required', Rule::in($metadataValues)],
            'logfc_cutoff'           => ['numeric'],
            'qvalue_cutoff'          => ['numeric'],
            'min_count_cutoff'       => ['numeric'],
            'min_total_count_cutoff' => ['numeric'],
            'min_prop'               => ['numeric'],
            'covariates'             => ['array'],
            'covariates.*'           => [CommonRules::metadataByCapability(Capabilities::COVARIATE)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            [
                'logfc_cutoff'           => $this->input('logfc_cutoff', 0.6),
                'qvalue_cutoff'          => $this->input('qvalue_cutoff', 0.05),
                'min_count_cutoff'       => $this->input('min_count_cutoff', 5),
                'min_total_count_cutoff' => $this->input('min_total_count_cutoff', 15),
                'min_prop'               => $this->input('min_prop', 0.7),
                'covariates'             => $this->input('covariates', []),
            ]
        );
    }

    protected function buildAvailableContrastsValues(): array
    {
        $metadata = (array)$this->metadata;
        $dataset = $this->dataset;

        try {
            return ComputeMetadataValuesAction::make($dataset, $metadata)->handle();
        } catch (Throwable $e) {
            Log::error($e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return [];
        }
    }
}
