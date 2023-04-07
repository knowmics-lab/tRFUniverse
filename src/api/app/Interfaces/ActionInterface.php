<?php

namespace App\Interfaces;

/**
 * @template T
 */
interface ActionInterface
{

    public function getCacheFile(): string;

    /**
     * @return T
     */
    public function handle();

}