<?php

namespace App\Http\Controllers;

use App\TrfExplorer\Utils;

class MorpheusController extends Controller
{

    /**
     * @throws \JsonException
     */
    public function __invoke(string $dataKey)
    {
        $filename = Utils::cachePath($dataKey, '_output.json');
        abort_if(!file_exists($filename), 404, 'Analysis not found');
        $data = json_decode(file_get_contents($filename), true, 512, JSON_THROW_ON_ERROR);

        return view('morpheus', compact('data'));
    }
}
