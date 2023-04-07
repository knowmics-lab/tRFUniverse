<?php

namespace Database\Seeders;

use App\Models\Aminoacid;
use App\Models\Anticodon;
use App\Models\Chromosome;
use App\Models\Fragment;
use App\Models\FragmentPosition;
use App\Models\FragmentSynonym;
use App\Models\FragmentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FragmentSeeder extends Seeder
{

    use WithoutModelEvents;

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $fragments = $this->readFragments();
        $this->processLargeInsert(Fragment::class, $fragments['fragments']);
        $this->processLargeInsert(FragmentType::class, $fragments['types']);
        $fragmentIds = Fragment::pluck('id', 'name');
        foreach ($fragments['positions'] as &$position) {
            $position['fragment_id'] = $fragmentIds[$position['fragment_id']];
        }
        unset($position);
        $this->processLargeInsert(FragmentPosition::class, $fragments['positions']);
        foreach ($fragments['synonyms'] as &$synonym) {
            $synonym['fragment_id'] = $fragmentIds[$synonym['fragment_id']];
        }
        unset($synonym);
        $this->processLargeInsert(FragmentSynonym::class, $fragments['synonyms']);
        $this->processLargeInsert(Chromosome::class, $fragments['chromosomes']);
        $this->processLargeInsert(Aminoacid::class, $fragments['aminoacids']);
        $this->processLargeInsert(Anticodon::class, $fragments['anticodons']);
    }

    protected function readFragments(): array
    {
        $fragments = [
            'fragments'   => [],
            'positions'   => [],
            'chromosomes' => [],
            'types'       => [],
            'tRNAs'       => [],
            'aminoacids'  => [],
            'anticodons'  => [],
            'synonyms'    => [],
        ];
        $now = now();
        $inputPath = config('trfuniverse.raw_data_files.trf_annotations');
        $fp = gzopen($inputPath, 'r');
        gzgets($fp); // skip header
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp), "\t");
            if (count($data) < 10) {
                continue;
            }
            if (!isset($fragments['fragments'][$data[0]])) {
                $fragments['fragments'][$data[0]] = [
                    'name'       => $data[0],
                    'width'      => $data[5],
                    'type'       => $data[6],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if (!isset($fragments['types'][$data[6]])) {
                $fragments['types'][$data[6]] = [
                    'name' => $data[6],
                ];
            }
            if (!isset($fragments['chromosomes'][$data[1]])) {
                $fragments['chromosomes'][$data[1]] = [
                    'name' => $data[1],
                ];
            }
            if (!isset($fragments['aminoacids'][$data[7]])) {
                $fragments['aminoacids'][$data[7]] = [
                    'name' => $data[7],
                ];
            }
            if (!isset($fragments['anticodons'][$data[8]])) {
                $fragments['anticodons'][$data[8]] = [
                    'name' => $data[8],
                ];
            }
            $fragments['positions'][] = [
                'fragment_id' => $data[0],
                'chromosome'  => $data[1],
                'start'       => $data[2],
                'end'         => $data[3],
                'strand'      => $data[4],
                'aminoacid'   => $data[7],
                'anticodon'   => $data[8],
                'created_at'  => $now,
                'updated_at'  => $now,
            ];
            $data[9] = explode(',', trim($data[9]));
            foreach ($data[9] as $synonym) {
                if (strtolower($synonym) === 'na') {
                    continue;
                }
                $key = md5($data[0].'-'.$synonym); // unique key to avoid duplicates
                $fragments['synonyms'][$key] = [
                    'fragment_id' => $data[0],
                    'synonym'     => $synonym,
                ];
            }
        }
        gzclose($fp);
        $fragments['fragments'] = array_values($fragments['fragments']);
        $fragments['synonyms'] = array_values($fragments['synonyms']);

        return $fragments;
    }

    protected function processLargeInsert(string $class, array $data): void
    {
        $chunks = array_chunk($data, 1000);
        foreach ($chunks as $chunk) {
            call_user_func([$class, 'insert'], $chunk);
        }
    }
}
