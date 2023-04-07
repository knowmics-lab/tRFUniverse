<?php
/** @noinspection ForgottenDebugOutputInspection */

namespace Database\Seeders;

use App\Models\Target;
use App\Models\TargetExpression;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TargetExpressionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     * @throws \JsonException
     */
    public function run(): void
    {
        $schemaBuilder = DB::getSchemaBuilder();
        $schemaBuilder->disableForeignKeyConstraints();
        $fp = gzopen(config('trfuniverse.raw_data_files.targets_lfcs_matrix'), 'r');
        $header = str_getcsv(gzgets($fp));
        $header = array_slice($header, 1);
        $tmpData = [];
        $count = 0;
        while (($line = gzgets($fp)) !== false) {
            $data = str_getcsv($line);
            $targetId = (int)$data[0];
            if (isset(TargetSeeder::$excludedTargets[$targetId])) {
                continue;
            }
            $tmpData[] = [
                'target_id'   => $targetId,
                'expressions' => json_encode(
                    collect(array_combine($header, array_slice($data, 1)))
                        ->mapToGroups(
                            function ($item, $key) {
                                $key = explode('.', $key);
                                $datasetId = str_replace('_', '-', $key[0]);

                                return [$datasetId => [$key[1] => $item]];
                            }
                        )
                        ->map
                        ->flatMap(fn($item) => $item)
                        ->filter(fn(Collection $item) => $item['logFC'] !== 'NA' && $item['p'] !== 'NA')
                        ->map(
                            static function (Collection $item) {
                                $item['logFC'] = (float)$item['logFC'];
                                $item['p'] = (float)$item['p'];

                                return $item->toArray();
                            }
                        )->toArray(),
                    JSON_THROW_ON_ERROR
                ),
            ];
            if (count($tmpData) > 1000) {
                TargetExpression::insert($tmpData);
                $tmpData = [];
            }
            $count++;
            if ($count % 10000 === 0) {
                $this->command->getOutput()->write("\r\t<info>Processed $count targets.</info>");
            }
        }
        if (count($tmpData) > 0) {
            TargetExpression::insert($tmpData);
        }
        gzclose($fp);
        $this->command->newLine();
        $schemaBuilder->enableForeignKeyConstraints();
    }
}
