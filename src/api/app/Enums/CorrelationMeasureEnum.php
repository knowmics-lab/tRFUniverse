<?php

namespace App\Enums;

enum CorrelationMeasureEnum: string
{
    case PEARSON = 'pearson';
    case SPEARMAN = 'spearman';
    case KENDALL = 'kendall';
}
