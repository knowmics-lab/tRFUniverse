<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Target
 */
class TargetResource extends JsonResource
{

    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'fragment_id'   => $this->fragment_id,
            'fragment_name' => $this->whenLoaded('fragment', fn() => $this->fragment->name),
            'gene_id'       => $this->gene_id,
            'gene_name'     => $this->gene_name,
            'count'         => $this->count,
            'mfe'           => $this->mfe,
            'binding_sites' => BindingSiteResource::collection($this->whenLoaded('bindingSites')),
            'expressions'   => $this->whenLoaded('expression', fn() => $this->expression->expressions),
        ];
    }
}
