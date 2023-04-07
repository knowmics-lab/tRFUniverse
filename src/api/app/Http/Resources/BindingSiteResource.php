<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\TargetBindingSite
 */
class BindingSiteResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'transcript_id'   => $this->transcript_id,
            'transcript_name' => $this->transcript_name,
            'position'        => $this->position,
            'start'           => $this->start,
            'end'             => $this->end,
            'count'           => $this->count,
            'mfe'             => $this->mfe,
            'sources'         => BindingSiteSourceResource::collection($this->whenLoaded('sources')),
        ];
    }
}
