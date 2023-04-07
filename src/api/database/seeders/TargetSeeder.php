<?php
/** @noinspection MultiAssignmentUsageInspection */

namespace Database\Seeders;

use App\Models\Fragment;
use App\Models\Target;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TargetSeeder extends Seeder
{

    public static array $excludedTargets = [];

    public array $targets = [];

    /**
     * Run the database seeds.
     *
     * @return void
     * @throws \Throwable
     */
    public function run(): void
    {
        $schemaBuilder = DB::getSchemaBuilder();
        $schemaBuilder->disableForeignKeyConstraints();
        self::$excludedTargets = [];
        if (config('app.debug')) {
            // In debug mode seeds only the targets of the first 1000 fragments
            $fragments = Fragment::limit(1000)->pluck('id', 'name');
        } else {
            $fragments = Fragment::pluck('id', 'name');
        }
        $fp = gzopen(config('trfuniverse.raw_data_files.gene_targets'), 'r');
        gzgets($fp); // skip header
        $toInsert = [];
        $count = 0;
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (count($data) < 6) {
                continue;
            }
            $fragmentName = $data[0];
            if (!isset($fragments[$fragmentName])) {
                self::$excludedTargets[$data[5]] = true;
                continue;
            }
            $fragmentId = $fragments[$fragmentName];
            $toInsert[] = [
                'id'          => (int)$data[5],
                'fragment_id' => $fragmentId,
                'gene_id'     => $data[1],
                'gene_name'   => $data[2],
                'mfe'         => (double)$data[3],
                'count'       => (int)$data[4],
            ];
            if (count($toInsert) >= 1000) {
                Target::insert($toInsert);
                $toInsert = [];
            }
            $count++;
            if ($count % 10000 === 0) {
                $this->command->getOutput()->write("\r\t<info>Processed $count targets.</info>");
            }
        }
        if (count($toInsert) > 0) {
            Target::insert($toInsert);
        }
        gzclose($fp);
        $this->command->newLine();
        $schemaBuilder->enableForeignKeyConstraints();
        $schemaBuilder->table(
            'targets',
            static function (Blueprint $table) {
                $table->index('gene_id');
            }
        );
    }

}
