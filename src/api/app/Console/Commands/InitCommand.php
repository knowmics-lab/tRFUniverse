<?php

namespace App\Console\Commands;

use App\TrfExplorer\Utils;
use Illuminate\Console\Command;

class InitCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'init';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize the application';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        if (file_exists(storage_path('app/.running'))) {
            $this->error('The init script is already running');

            return 0;
        }
        touch(storage_path('app/.running'));
        if (!file_exists(config('trfuniverse.expressions_path'))) {
            $this->info('Downloading expressions archive...');
            $outputDir = dirname(config('trfuniverse.expressions_path'));
            $outputFile = $outputDir.'/expressions.zip';
            Utils::downloadFile(config('trfuniverse.urls.tRNAderived.expressions'), $outputFile);
            Utils::extractArchive($outputFile, $outputDir);
            $this->info('Downloading mRNA and miRNAs expressions archive...');
            $outputFile = $outputDir.'/mRNA_miRNAs.zip';
            Utils::downloadFile(config('trfuniverse.urls.other_expressions'), $outputFile);
            Utils::extractArchive($outputFile, config('trfuniverse.expressions_path'));
            unlink($outputFile);
        }
        if (!file_exists(config('trfuniverse.raw_data_files.enrichment_dataset'))) {
            $this->info('Downloading enrichment dataset...');
            $outputDir = dirname(config('trfuniverse.raw_data_files.enrichment_dataset'));
            Utils::downloadFile(
                config('trfuniverse.urls.enrichment_dataset'),
                $outputDir.'/enrichment_dataset.zip'
            );
            Utils::extractArchive(
                $outputDir.'/enrichment_dataset.zip',
                $outputDir
            );
        }
        if (!file_exists(config('trfuniverse.raw_data_files.gene_targets'))) {
            $this->info('Downloading target genes...');
            Utils::downloadFile(
                config('trfuniverse.urls.gene_targets'),
                config('trfuniverse.raw_data_files.gene_targets')
            );
        }
        if (!file_exists(config('trfuniverse.raw_data_files.binding_sites'))) {
            $this->info('Downloading target binding sites...');
            Utils::downloadFile(
                config('trfuniverse.urls.binding_sites'),
                config('trfuniverse.raw_data_files.binding_sites')
            );
        }
        if (!file_exists(config('trfuniverse.raw_data_files.binding_sites_sources'))) {
            $this->info('Downloading target binding sites sources...');
            Utils::downloadFile(
                config('trfuniverse.urls.binding_sites_sources'),
                config('trfuniverse.raw_data_files.binding_sites_sources')
            );
        }
        if (!file_exists(config('trfuniverse.raw_data_files.targets_lfcs_matrix'))) {
            $this->info('Downloading targets logFCs matrix...');
            Utils::downloadFile(
                config('trfuniverse.urls.targets_lfcs_matrix'),
                config('trfuniverse.raw_data_files.targets_lfcs_matrix')
            );
        }
        if (!file_exists(config('trfuniverse.raw_data_files.targets_lfcs_matrix_rds'))) {
            $this->info('Downloading and extracting targets logFCs matrix index...');
            $outputDir = dirname(config('trfuniverse.raw_data_files.targets_lfcs_matrix_rds'));
            $outputFile = $outputDir.'/targets_lfcs_matrix.zip';
            Utils::downloadFile(
                config('trfuniverse.urls.targets_lfcs_matrix_rds'),
                $outputFile
            );
            Utils::extractArchive($outputFile, $outputDir);
            unlink($outputFile);
        }
        if (!file_exists(storage_path('app/.migrated'))) {
            $this->call('migrate:fresh', ['--force' => true, '--seed' => true]);
            touch(storage_path('app/.migrated'));
        }
        $this->info('Application initialized');
        unlink(storage_path('app/.running'));

        return 0;
    }
}
