<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Fragment
 */
class FragmentResource extends JsonResource
{

    public function toArray($request): array
    {
        return $this->only(['id', 'name', 'width', 'type']);
    }
}
