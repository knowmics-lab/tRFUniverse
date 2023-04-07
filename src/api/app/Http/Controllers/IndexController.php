<?php

namespace App\Http\Controllers;


class IndexController extends Controller
{
    public function __invoke(): array
    {
        return $this->returnData(['tRFUniverse' => '2.0.0']);
    }
}