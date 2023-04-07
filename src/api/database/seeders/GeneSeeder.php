<?php

namespace Database\Seeders;

use App\Enums\ComparisonExpressionTypeEnum;
use App\Models\Gene;
use Illuminate\Database\Seeder;

class GeneSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $this->importDataFromFile(
            config('trfuniverse.expressions_path').'/all_genes.tsv',
            ComparisonExpressionTypeEnum::GENES
        );
        $this->importDataFromFile(
            config('trfuniverse.expressions_path').'/all_mirnas.tsv',
            ComparisonExpressionTypeEnum::MIRNAS
        );
    }

    private function importDataFromFile(string $file, ComparisonExpressionTypeEnum $type): void
    {
        $genes = [];
        $fp = fopen($file, 'rb');
        fgetcsv($fp); // skip header
        while (!feof($fp)) {
            $line = fgetcsv($fp, null, "\t");
            if (empty($line)) {
                continue;
            }
            $genes[] = [
                'gene_id'      => $line[0],
                'gene_name'    => $line[1],
                'gene_type'    => $line[2],
                'dataset_type' => $type->value,
            ];
            if (count($genes) >= 1000) {
                Gene::insert($genes);
                $genes = [];
            }
        }
        if (count($genes) > 0) {
            Gene::insert($genes);
        }
    }
}
