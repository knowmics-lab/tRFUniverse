<?php

namespace App\Enums;

enum FilterDirectionEnum: string
{
    case POSITIVE = 'positive';
    case NEGATIVE = 'negative';
    case BOTH = 'both';
}

