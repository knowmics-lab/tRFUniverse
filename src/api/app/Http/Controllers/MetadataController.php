<?php

namespace App\Http\Controllers;

use App\Http\Resources\MetadataResource;
use App\Models\Metadata;

class MetadataController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function __invoke()
    {
        return MetadataResource::collection(Metadata::all());
    }
}
