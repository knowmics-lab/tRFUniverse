<?php

namespace App\Traits;

use App\TrfExplorer\Utils;

trait DefaultCacheFileTrait
{

    public function getCacheFile(): string
    {
        $vars = get_object_vars($this);
        if (isset($vars['publicCacheFile'])) {
            unset($vars['publicCacheFile']);
        }
        if (isset($vars['cacheFileExtension'])) {
            unset($vars['cacheFileExtension']);
        }
        $dataArray = [__CLASS__, ...array_values($vars)];

        return $this->isPublicCacheFile() ? Utils::publicCachePath(
            $dataArray,
            $this->getCacheFileExtension()
        ) : Utils::cachePath(
            $dataArray,
            $this->getCacheFileExtension()
        );
    }

    public function isPublicCacheFile(): bool
    {
        return $this->publicCacheFile ?? false;
    }

    public function getCacheFileExtension(): string
    {
        return $this->cacheFileExtension ?? '.json';
    }

}