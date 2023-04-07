<?php

namespace Database\Seeders;

use App\Models\Combination;
use Illuminate\Database\Seeder;

class CombinationSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $combinations = $this->readCombinations(
            file:           config('trfuniverse.raw_data_files.combinations.NCI60'),
            commonMetadata: [
                                'dataset' => 'NCI60',
                            ]
        );
        $this->call(
            class:      CombinationFragmentMinValueSeeder::class,
            silent:     true,
            parameters: [
                            'filename'     => config('trfuniverse.raw_data_files.min_values.NCI60'),
                            'combinations' => $combinations,
                        ]
        );
        $combinations = $this->readCombinations(
            file: config('trfuniverse.raw_data_files.combinations.TCGA_TARGET')
        );
        $this->call(
            class:      CombinationFragmentMinValueSeeder::class,
            silent:     true,
            parameters: [
                            'filename'     => config('trfuniverse.raw_data_files.min_values.TCGA_TARGET'),
                            'combinations' => $combinations,
                        ]
        );
        $combinations = $this->readCombinations(
            file: config('trfuniverse.raw_data_files.combinations.fluids')
        );
        $this->call(
            class:      CombinationFragmentMinValueSeeder::class,
            silent:     true,
            parameters: [
                            'filename'     => config('trfuniverse.raw_data_files.min_values.fluids'),
                            'combinations' => $combinations,
                        ]
        );
    }

    protected function readCombinations(string $file, array $commonMetadata = []): array
    {
        $combinations = [];
        $fp = gzopen($file, 'rb');
        $header = str_getcsv(gzgets($fp));
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (count($data) !== count($header)) {
                continue;
            }
            $tmpData = [];
            $tmpData += $commonMetadata;
            foreach ($header as $i => $key) {
                $tmpData[$key] = strtolower($data[$i]) === 'na' ? null : $data[$i];
            }
            $combination = Combination::insertGetId($tmpData);
            $combinations[] = $combination;
        }
        gzclose($fp);

        return $combinations;
    }
}
