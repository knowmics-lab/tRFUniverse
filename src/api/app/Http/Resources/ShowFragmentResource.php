<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Fragment
 */
class ShowFragmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'width'        => $this->width,
            'type'         => $this->type,
            'synonyms'     => $this->whenLoaded('synonyms', fn() => $this->synonyms->pluck('synonym')),
            'expressed_in' => $this->minExpressions()
                                   ->joinRelationship('combination')
                                   ->groupBy('combinations.dataset')
                                   ->select('combinations.dataset')
                                   ->orderBy('combinations.dataset')
                                   ->pluck('dataset'),
            'positions'    => PositionResource::collection($this->whenLoaded('positions')),
        ];
    }
}
