<?php

namespace App\Enums;

enum MetadataTypeEnum: string
{
    case CATEGORY = 'category';
    case BOOLEAN = 'boolean';
    case FLOAT = 'float';
    case STRING = 'string';
}
