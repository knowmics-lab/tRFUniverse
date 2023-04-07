<?php

namespace App\Enums;

enum FilteringFunctionEnum: string
{
    case MAD = "mad";
    case VARIANCE = "variance";
    case ABSOLUTE_MEDIAN = "absolute_median";
    case ABSOLUTE_MEAN = "absolute_mean";
}
