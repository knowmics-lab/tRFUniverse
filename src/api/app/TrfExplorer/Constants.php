<?php

namespace App\TrfExplorer;

class Constants
{
    public const SAMPLES_CASTS = [
        'sample_id'                         => 'string',
        'patient_id'                        => 'string',
        'age'                               => 'float',
        'weight'                            => 'float',
        'OS'                                => 'float',
        'DFS'                               => 'float',
        'DSS'                               => 'float',
        'PFS'                               => 'float',
        'history_neoadjuvant_treatment'     => 'boolean',
        'new_event_after_initial_treatment' => 'boolean',
        'radiation_therapy'                 => 'boolean',
        'MSI_score_MANTIS'                  => 'float',
        'MSI_sensor_score'                  => 'float',
        'aneuploidy_score'                  => 'float',
        'TMB'                               => 'float',
        'epithelial'                        => 'boolean',
        'tumor_purity'                      => 'float',
    ];
}