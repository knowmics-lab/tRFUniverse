<?php

namespace Database\Seeders;

use App\Enums\MetadataTypeEnum;
use App\Models\Metadata;
use App\Models\Sample;
use Illuminate\Database\Seeder;

class SampleSeeder extends Seeder
{

    /**
     * @var array<string, \App\Enums\MetadataTypeEnum>
     */
    protected array $metadataTypes = [];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $this->metadataTypes = Metadata::pluck('type', 'name')->toArray();
        $this->readNCI60Metadata();
        $this->readTCGAAndTargetMetadata();
    }

    protected function readNCI60Metadata(): void
    {
        $inputPath = config('trfuniverse.raw_data_files.NCI60_metadata');
        $fp = gzopen($inputPath, 'r');
        $headers = str_getcsv(gzgets($fp));
        $tmpData = [];
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            $sample = [];
            foreach ($headers as $i => $header) {
                $sample[$header] = $this->cast($header, $data[$i]);
            }
            $sample['dataset'] = 'NCI60';
            $sample['dataset_name'] = 'NCI60';
            $tmpData[] = $sample;
            if (count($tmpData) >= 1000) {
                Sample::insert($tmpData);
                $tmpData = [];
            }
        }
        if (count($tmpData) > 0) {
            Sample::insert($tmpData);
        }
        gzclose($fp);
    }

    protected function cast(string $key, mixed $value): mixed
    {
        if (strtolower($value) === 'na') {
            return null;
        }

        return match ($this->metadataTypes[$key] ?? MetadataTypeEnum::STRING) {
            MetadataTypeEnum::FLOAT   => (float)$value,
            MetadataTypeEnum::BOOLEAN => strtolower($value) === 'yes' || strtolower($value) === 'y',
            default                   => $value,
        };
    }

    protected function readTCGAAndTargetMetadata(): void
    {
        $inputPath = config('trfuniverse.raw_data_files.TCGA_TARGET_metadata');
        $fp = gzopen($inputPath, 'r');
        $headers = str_getcsv(gzgets($fp));
        $tmpData = [];
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            $sample = [];
            foreach ($headers as $i => $header) {
                if ($header === 'patient_id') {
                    continue;
                }
                $sample[$header] = $this->cast($header, $data[$i]);
            }
            if (is_null($sample['dataset'])) {
                continue;
            }
            $tmpData[] = $sample;
            if (count($tmpData) >= 1000) {
                Sample::insert($tmpData);
                $tmpData = [];
            }
        }
        if (count($tmpData) > 0) {
            Sample::insert($tmpData);
        }
        gzclose($fp);
    }
}
