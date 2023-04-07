<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Metadata
 */
class MetadataResource extends JsonResource
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
        $metadataArray = parent::toArray($request);
        $metadataArray['props'] = $metadataArray['options'];
        unset($metadataArray['options']);

        return $metadataArray;
    }
}
