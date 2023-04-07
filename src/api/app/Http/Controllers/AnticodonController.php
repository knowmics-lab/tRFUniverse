<?php

namespace App\Http\Controllers;

use App\Http\Resources\NamedEntityResource;
use App\Models\Anticodon;

class AnticodonController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function __invoke()
    {
        return NamedEntityResource::collection(Anticodon::all());
    }
}
