<?php

namespace Database\Seeders;

use App\Models\TargetBindingSite;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TargetBindingSiteSeeder extends Seeder
{
    public static array $excludedBindingSites = [];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $schemaBuilder = DB::getSchemaBuilder();
        $schemaBuilder->disableForeignKeyConstraints();
        self::$excludedBindingSites = [];
        $fp = gzopen(config('trfuniverse.raw_data_files.binding_sites'), 'r');
        gzgets($fp); // skip header
        $toInsert = [];
        $count = 0;
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (count($data) < 9) {
                continue;
            }
            if (isset(TargetSeeder::$excludedTargets[$data[0]])) {
                self::$excludedBindingSites[$data[8]] = true;
                continue;
            }
            $toInsert[] = [
                'id'              => (int)$data[8],
                'target_id'       => (int)$data[0],
                'transcript_id'   => $data[1],
                'transcript_name' => $data[2],
                'position'        => $data[3],
                'start'           => (int)$data[4],
                'end'             => (int)$data[5],
                'mfe'             => (double)$data[6],
                'count'           => (int)$data[7],
            ];
            if (count($toInsert) >= 1000) {
                TargetBindingSite::insert($toInsert);
                $toInsert = [];
            }
            $count++;
            if ($count % 10000 === 0) {
                $this->command->getOutput()->write("\r\t<info>Processed $count binding sites.</info>");
            }
        }
        if (count($toInsert) > 0) {
            TargetBindingSite::insert($toInsert);
        }
        gzclose($fp);
        $this->command->newLine();
        $schemaBuilder->enableForeignKeyConstraints();
        $schemaBuilder->table(
            'target_binding_sites',
            static function (Blueprint $table) {
                $table->index('transcript_id');
            }
        );
    }
}
