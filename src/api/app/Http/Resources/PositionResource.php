<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\FragmentPosition
 */
class PositionResource extends JsonResource
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
        return $this->only(
            [
                'id',
                'chromosome',
                'start',
                'end',
                'strand',
                'aminoacid',
                'anticodon',
            ]
        );
    }
}
