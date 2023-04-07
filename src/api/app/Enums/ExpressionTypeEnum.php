<?php

namespace App\Enums;

enum ExpressionTypeEnum: string
{
    case RPM = 'rpm';
    case COUNTS = 'counts';
    case NORM_COUNTS = 'norm_counts';
}
