<?php

namespace Database\Seeders;

use App\Models\TargetSample;
use Illuminate\Database\Seeder;

class TargetSampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $fp = gzopen(config('trfuniverse.raw_data_files.targets_metadata'), 'r');
        gzgets($fp); // skip header
        $toInsert = [];
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (count($data) < 6) {
                continue;
            }
            $toInsert[] = [
                'id'        => (int)$data[5],
                'dataset'   => $data[0],
                'sample'    => $data[1],
                'type'      => $data[2],
                'cell_line' => $data[3],
                'ago'       => $data[4],
            ];
        }
        TargetSample::insert($toInsert);
        gzclose($fp);
    }
}
