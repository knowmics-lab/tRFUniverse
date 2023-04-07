<?php

namespace Database\Seeders;

use App\Models\TargetBindingSiteSource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TargetBindingSiteSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $schemaBuilder = DB::getSchemaBuilder();
        $schemaBuilder->disableForeignKeyConstraints();
        $fp = gzopen(config('trfuniverse.raw_data_files.binding_sites_sources'), 'r');
        gzgets($fp); // skip header
        $toInsert = [];
        $count = 0;
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (count($data) < 6) {
                continue;
            }
            if (isset(TargetBindingSiteSeeder::$excludedBindingSites[$data[5]])) {
                continue;
            }
            $toInsert[] = [
                'algorithm'              => $data[0],
                'fragment_sequence'      => $data[1],
                'target_sequence'        => $data[2],
                'mfe'                    => (double)$data[3],
                'sample_id'              => (int)$data[4],
                'target_binding_site_id' => (int)$data[5],
            ];
            if (count($toInsert) >= 1000) {
                TargetBindingSiteSource::insert($toInsert);
                $toInsert = [];
            }
            $count++;
            if ($count % 10000 === 0) {
                $this->command->getOutput()->write("\r\t<info>Processed $count binding site sources.</info>");
            }
        }
        if (count($toInsert) > 0) {
            TargetBindingSiteSource::insert($toInsert);
        }
        gzclose($fp);
        $this->command->newLine();
        $schemaBuilder->enableForeignKeyConstraints();
    }
}
