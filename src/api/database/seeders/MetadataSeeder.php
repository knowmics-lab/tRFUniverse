<?php

namespace Database\Seeders;

use App\Enums\MetadataTypeEnum;
use App\Models\Metadata;
use Illuminate\Database\Seeder;

class MetadataSeeder extends Seeder
{

    protected const DEFAULT_FLOAT = ['min' => INF, 'max' => -INF];
    protected const YES_NO        = [true => 'Yes', false => 'No'];
    protected const YES_NO_NA     = [true => 'Yes', false => 'No', 'na' => 'Unknown'];

    protected array $metadata = [];
    protected array $searchableMetadata = [];

    public function run(): void
    {
        $this->readSearchableMetadata();
        $this->readMetadataTable();
        $this->readNCI60Metadata();
        $this->readFluidMetadata();
        $this->readTCGAAndTargetMetadata();
        foreach ($this->metadata as $meta) {
            unset($meta['described_by'], $meta['keep_na']);
            Metadata::create($meta);
        }
    }

    protected function readSearchableMetadata(): void
    {
        $inputPaths = config('trfuniverse.raw_data_files.combinations');
        $headers = [];
        foreach ($inputPaths as $inputPath) {
            $fp = gzopen($inputPath, 'rb');
            $headers[] = str_getcsv(gzgets($fp));
            gzclose($fp);
        }
        $this->searchableMetadata = array_unique(array_merge(...$headers));
    }

    protected function readMetadataTable(): void
    {
        $fp = gzopen(config('trfuniverse.raw_data_files.metadata_table'), 'r');
        $headers = str_getcsv(gzgets($fp));
        $descriptionHeaders = array_slice($headers, 0, 6);
        $capabilitiesHeaders = array_slice($headers, 6);
        while (($line = gzgets($fp)) !== false) {
            $data = str_getcsv($line);
            if ((int)$data[3] === 1) {
                continue;
            }
            $description = array_combine($descriptionHeaders, array_slice($data, 0, 6));
            unset($description['ignored']);
            $description['keep_na'] = (int)$description['keep_na'] === 1;
            $description['capabilities'] = array_combine(
                $capabilitiesHeaders,
                array_map(
                    static fn($value) => (int)$value === 1,
                    array_slice($data, 6)
                )
            );
            $description['capabilities']['search'] = in_array(
                $description['name'],
                $this->searchableMetadata,
                true
            );
            $description['type'] = MetadataTypeEnum::from($description['type']);
            $description['values'] = [];
            if ($description['type'] === MetadataTypeEnum::FLOAT) {
                $description['values'] = self::DEFAULT_FLOAT;
            }
            $description['values_by_dataset'] = [];
            $this->metadata[$description['name']] = $description;
        }
        gzclose($fp);
    }

    protected function readNCI60Metadata(): void
    {
        $inputPath = config('trfuniverse.raw_data_files.NCI60_metadata');
        $fp = gzopen($inputPath, 'r');
        $headers = str_getcsv(gzgets($fp));
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            foreach ($headers as $i => $header) {
                $this->collect($header, $data[$i], null, 'NCI60');
            }
        }
        $this->collect('dataset', 'NCI60', 'NCI60', 'NCI60');
        gzclose($fp);
    }

    protected function readFluidMetadata(): void
    {
        $inputPath = config('trfuniverse.raw_data_files.fluids_metadata');
        $fp = gzopen($inputPath, 'r');
        $headers = str_getcsv(gzgets($fp));
        $datasetIdx = array_search('dataset', $headers, true);
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (strtolower($data[$datasetIdx]) === 'na') {
                $this->command->warn(sprintf('Fluids metadata contains NA dataset (%s)', implode(', ', $data)));
                continue;
            }
            foreach ($headers as $i => $header) {
                $description = null;
                if (isset($this->metadata[$header]) && !empty($this->metadata[$header]['described_by']) && strtolower(
                        $this->metadata[$header]['described_by']
                    ) !== 'na') {
                    $idx = array_search($this->metadata[$header]['described_by'], $headers, true);
                    if ($idx !== false) {
                        $description = $data[$idx];
                    }
                }
                $this->collect($header, $data[$i], $description, $data[$datasetIdx]);
            }
        }
        gzclose($fp);
    }

    protected function collect(string $key, mixed $value, mixed $description, string $dataset): void
    {
        if (!isset($this->metadata[$key])) {
            return;
        }
        $isNA = strtolower($value) === 'na';
        if (!$this->metadata[$key]['keep_na'] && $isNA) {
            return;
        }
        $description = empty($description) ? $value : $description;
        $description = $isNA ? 'Unknown' : $description;
        switch ($this->metadata[$key]['type']) {
            case MetadataTypeEnum::BOOLEAN:
                $values = $this->metadata[$key]['keep_na'] ? self::YES_NO_NA : self::YES_NO;
                if (empty($this->metadata[$key]['values'])) {
                    $this->metadata[$key]['values'] = $values;
                }
                if (!isset($this->metadata[$key]['values_by_dataset'][$dataset])) {
                    $this->metadata[$key]['values_by_dataset'][$dataset] = $values;
                }
                break;
            case MetadataTypeEnum::CATEGORY:
                if (!isset($this->metadata[$key]['values_by_dataset'][$dataset])) {
                    $this->metadata[$key]['values_by_dataset'][$dataset] = [];
                }
                $this->metadata[$key]['values'][$value] = $description;
                $this->metadata[$key]['values_by_dataset'][$dataset][$value] = $description;
                break;
            case MetadataTypeEnum::FLOAT:
                $this->metadata[$key]['values'] = self::evaluateMinMax($this->metadata[$key]['values'], (float)$value);
                $this->metadata[$key]['values_by_dataset'][$dataset] = self::evaluateMinMax(
                    $this->metadata[$key]['values_by_dataset'][$dataset] ?? self::DEFAULT_FLOAT,
                    (float)$value
                );
                break;
            case MetadataTypeEnum::STRING:
            default:
                break;
        }
    }

    protected static function evaluateMinMax(array $data, float $value): array
    {
        $data['min'] = min($data['min'], $value);
        $data['max'] = max($data['max'], $value);

        return $data;
    }

    protected function readTCGAAndTargetMetadata(): void
    {
        $inputPath = config('trfuniverse.raw_data_files.TCGA_TARGET_metadata');
        $fp = gzopen($inputPath, 'r');
        $headers = str_getcsv(gzgets($fp));
        $datasetIdx = array_search('dataset', $headers, true);
        while (!gzeof($fp)) {
            $data = str_getcsv(gzgets($fp));
            if (strtolower($data[$datasetIdx]) === 'na') {
                continue;
            }
            foreach ($headers as $i => $header) {
                $description = null;
                if (isset($this->metadata[$header]) && !empty($this->metadata[$header]['described_by']) && strtolower(
                        $this->metadata[$header]['described_by']
                    ) !== 'na') {
                    $idx = array_search($this->metadata[$header]['described_by'], $headers, true);
                    if ($idx !== false) {
                        $description = $data[$idx];
                    }
                }
                $this->collect($header, $data[$i], $description, $data[$datasetIdx]);
            }
        }
        gzclose($fp);
    }
}
