<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Gene
 * @property mixed $sources_avg_read_count
 * @property mixed $sources_avg_rnafold_score
 * @property mixed $sources_avg_rnaup_score
 */
class GeneResource extends JsonResource
{

    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'gene_id'      => $this->gene_id,
            'gene_name'    => $this->gene_name,
            'gene_type'    => ucfirst(implode(' ', explode('_', $this->gene_type))),
            'dataset_type' => $this->dataset_type->value,
        ];
    }
}
