<?php

namespace Database\Seeders;

use App\Models\CombinationFragmentMinValue;
use App\Models\Fragment;
use Illuminate\Database\Seeder;

class CombinationFragmentMinValueSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @param  string  $filename
     * @param  array  $combinations
     *
     * @return void
     */
    public function run(string $filename, array $combinations): void
    {
        $fp = gzopen($filename, 'rb');
        $fragments = $this->processFragments(str_getcsv(gzgets($fp)));
        $tmpData = [];
        $i = 0;
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            $combinationId = $combinations[$i++];
            foreach ($data as $j => $value) {
                if (is_null($fragments[$j])) {
                    continue;
                }
                $value = (double)$value;
                if ($value === 0.0) {
                    continue;
                }
                $tmpData[] = [
                    'combination_id' => $combinationId,
                    'fragment_id'    => $fragments[$j],
                    'value'          => $value,
                ];
                if (count($tmpData) === 1000) {
                    CombinationFragmentMinValue::insert($tmpData);
                    $tmpData = [];
                }
            }
        }
        if (count($tmpData) > 0) {
            CombinationFragmentMinValue::insert($tmpData);
        }
        gzclose($fp);
    }

    protected function processFragments(array $header): array
    {
        $fragments = Fragment::pluck('id', 'name')->toArray();
        $processedHeaders = [];
        foreach ($header as $i => $value) {
            $processedHeaders[$i] = $fragments[$value] ?? null;
        }

        return $processedHeaders;
    }
}
