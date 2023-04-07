<?php

namespace App\Traits;

trait Makeable
{

    public static function make(...$parameters): static
    {
        return new static(...$parameters);
    }

}