<?php

namespace Database\Seeders;

use App\Models\Metadata;
use Illuminate\Database\Seeder;

class DatasetOptionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $fp = gzopen(resource_path('raw_data/datasets.csv.gz'), 'r');
        $header = array_slice(str_getcsv(gzgets($fp)), 1);
        $options = [];
        while (!gzeof($fp)) {
            $row = str_getcsv(gzgets($fp));
            $datasetId = array_shift($row);
            $row = array_map(static fn($x) => $x === '1', $row);
            $options[$datasetId] = array_combine($header, $row);
        }
        gzclose($fp);
        Metadata::dataset()->first()->update(
            [
                'options' => $options,
            ]
        );
    }
}
