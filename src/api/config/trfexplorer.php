<?php

return [

    'frontend'           => explode(';', env('FRONTEND_URL', 'http://localhost:3000')),
    'disable_rate_limit' => env('DISABLE_RATE_LIMIT', false),

    'urls' => [
        'tRNAderived'             => [
            'expressions' => env('EXPRESSIONS_DATASETS', ''),
        ],
        'other_expressions'       => env('OTHER_EXPRESSION_DATASETS', ''),
        'enrichment_dataset'      => env('ENRICHMENT_OUTPUT_DATASET', ''),
        'targets_lfcs_matrix'     => env('DE_TARGETS_LFCS_MATRIX', ''),
        'targets_lfcs_matrix_rds' => env('DE_TARGETS_LFCS_MATRIX_RDS', ''),
        'gene_targets'            => env('GENE_TARGETS', ''),
        'binding_sites'           => env('BINDING_SITES', ''),
        'binding_sites_sources'   => env('BINDING_SITES_SOURCES', ''),
    ],

    'bin_path'          => resource_path('bin'),
    'expressions_path'  => storage_path('app/public/expressions_by_dataset'),
    'cache_path'        => storage_path('app/cache'),
    'public_cache_path' => storage_path('app/public/cache'),

    'raw_data_files' => [
        'trf_annotations'         => resource_path('raw_data/trf_annotations.tsv.gz'),
        'metadata_table'          => resource_path('raw_data/metadata_table.csv.gz'),
        'NCI60_metadata'          => resource_path('raw_data/NCI60_metadata.csv.gz'),
        'fluids_metadata'         => resource_path('raw_data/fluids_metadata.csv.gz'),
        'TCGA_TARGET_metadata'    => resource_path('raw_data/TCGA_TARGET_metadata.csv.gz'),
        'combinations'            => [
            'NCI60'       => resource_path('raw_data/NCI60_combination.csv.gz'),
            'TCGA_TARGET' => resource_path('raw_data/TCGA_TARGET_combination.csv.gz'),
            'fluids'      => resource_path('raw_data/fluids_combination.csv.gz'),
        ],
        'min_values'              => [
            'NCI60'       => resource_path('raw_data/NCI60_min_values_by_combination.csv.gz'),
            'TCGA_TARGET' => resource_path('raw_data/TCGA_TARGET_min_values_by_combination.csv.gz'),
            'fluids'      => resource_path('raw_data/fluids_min_values_by_combination.csv.gz'),
        ],
        'enrichment_dataset'      => storage_path('app/public/enrichment'),
        'targets_lfcs_matrix'     => storage_path('app/public/targets_lfcs_matrix.csv.gz'),
        'targets_lfcs_matrix_rds' => storage_path('app/public/lfcs_matrices'),
        'gene_targets'            => storage_path('app/public/gene_targets.csv.gz'),
        'binding_sites'           => storage_path('app/public/binding_sites.csv.gz'),
        'binding_sites_sources'   => storage_path('app/public/binding_sites_sources.csv.gz'),
        'targets_metadata'        => resource_path('raw_data/targets_metadata.csv.gz'),
    ],

    'patterns' => [
        'metadata'    => storage_path('app/public/expressions_by_dataset/%s_metadata.tsv'),
        'expressions' => [
            'counts' => storage_path('app/public/expressions_by_dataset/%s_counts.tsv'),
            'rpm'    => storage_path('app/public/expressions_by_dataset/%s_rpm.tsv'),
        ],
    ],

    'paginator_cache_validity' => 10 * 60 * 24, // 10 days

    'phensim' => [
        'url'                => env('PHENSIM_SERVER_URL', ''),
        'token'              => env('PHENSIM_SERVER_TOKEN', ''),
        'callback_debug_url' => env('PHENSIM_CALLBACK_DEBUG_URL'),
    ],


];
