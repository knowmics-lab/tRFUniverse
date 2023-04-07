<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\TargetBindingSiteSource
 */
class BindingSiteSourceResource extends JsonResource
{

    public function toArray($request): array
    {
        return [
            'dataset'           => $this->sample->dataset,
            'sample'            => $this->sample->sample,
            'type'              => $this->sample->type,
            'cell_line'         => $this->sample->cell_line,
            'ago'               => $this->sample->ago,
            'algorithm'         => $this->algorithm,
            'target_sequence'   => $this->target_sequence,
            'fragment_sequence' => $this->fragment_sequence,
            'mfe'               => $this->mfe,
        ];
    }
}
