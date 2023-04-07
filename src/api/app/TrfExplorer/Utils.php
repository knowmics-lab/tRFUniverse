<?php

namespace App\TrfExplorer;

use App\Exceptions\IgnoredException;
use App\Exceptions\ProcessingJobException;
use BackedEnum;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use JsonSerializable;
use RuntimeException;
use Stringable;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use UnitEnum;
use ZipArchive;

final class Utils
{

    public const IGNORED_ERROR_CODE = '===IGNORED===';

    /**
     * Map command exception to message
     *
     * @param  \Symfony\Component\Process\Exception\ProcessFailedException  $e
     * @param  array  $errorCodeMap
     *
     * @return IgnoredException|ProcessingJobException
     */
    public static function mapCommandException(
        ProcessFailedException $e,
        array $errorCodeMap = []
    ): IgnoredException|ProcessingJobException {
        $code = $e->getProcess()->getExitCode();
        if (isset($errorCodeMap[$code])) {
            if ($errorCodeMap[$code] === self::IGNORED_ERROR_CODE) {
                return new IgnoredException($code, $code);
            }

            return new ProcessingJobException($errorCodeMap[$code], $code, $e);
        }

        return new ProcessingJobException($e->getMessage(), $code, $e);
    }

    public static function downloadFile(string $url, string $file): void
    {
        if (file_exists($file)) {
            return;
        }
        $outputDir = dirname($file);
        if (!file_exists($outputDir) && !mkdir($outputDir, 0755, true) && !is_dir($outputDir)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created', $outputDir));
        }
        $cmd = [
            'wget',
            '-O',
            $file,
            $url,
        ];
        self::runCommand($cmd, $outputDir);
        if (!file_exists($file)) {
            throw new RuntimeException(
                sprintf('File "%s" was not downloaded', $file)
            );
        }
    }

    /**
     * Runs a shell command and checks for successful completion of execution
     *
     * @param  array  $command
     * @param  string|null  $cwd
     * @param  int|null  $timeout
     * @param  callable|null  $callback
     *
     * @return string|null
     */
    public static function runCommand(
        array $command,
        ?string $cwd = null,
        ?int $timeout = null,
        ?callable $callback = null
    ): ?string {
        $process = new Process($command, $cwd, null, null, $timeout);
        $process->run($callback);
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        return $process->getOutput();
    }

    public static function extractArchive(string $file, string $outputDir): void
    {
        if (!file_exists($file)) {
            return;
        }
        if (!file_exists($outputDir) && !mkdir($outputDir, 0755, true) && !is_dir($outputDir)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created', $outputDir));
        }
        $zip = new ZipArchive();
        $res = $zip->open($file);
        if (!$res) {
            throw new RuntimeException(sprintf('Archive "%s" was not opened', $file));
        }
        $zip->extractTo($outputDir);
        $zip->close();
    }

    public static function hashArray(array $array): string
    {
        return md5(json_encode($array, JSON_THROW_ON_ERROR));
    }

    public static function scriptPath(string $script, string $extension = '.R'): string
    {
        return config('trfuniverse.bin_path').'/'.$script.$extension;
    }

    public static function publicCachePath(string|array $name, string $extension = '.json'): string
    {
        return self::makeCachePath($name, $extension, config('trfuniverse.public_cache_path'));
    }

    private static function makeCachePath(string|array $name, string $extension, string $cachePath): string
    {
        if (is_array($name)) {
            $name = Arr::map(
                Arr::flatten($name),
                static function (mixed $item) {
                    if ($item === null) {
                        return 'NULL';
                    }
                    if (!is_object($item)) {
                        return (string)$item;
                    }
                    if ($item instanceof BackedEnum) {
                        return $item->value;
                    }
                    if ($item instanceof UnitEnum) {
                        return $item->name;
                    }
                    if ($item instanceof JsonSerializable) {
                        return $item->jsonSerialize();
                    }
                    if ($item instanceof Stringable) {
                        return $item->__toString();
                    }

                    return (string)$item;
                }
            );
            $name = md5(implode('_', $name));
        }
        $firstPath = substr($name, 0, 2);
        $secondPath = substr($name, 2, 2);
        $cachePath .= '/'.$firstPath.'/'.$secondPath;
        if (!file_exists($cachePath) && !mkdir($cachePath, 0755, true) && !is_dir($cachePath)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created', $cachePath));
        }

        return $cachePath.'/'.$name.$extension;
    }

    public static function cachePath(string|array $name, string $extension = '.json'): string
    {
        return self::makeCachePath($name, $extension, config('trfuniverse.cache_path'));
    }

    public static function publicCacheFileUrl(string $cacheFile): string
    {
        return Storage::disk('public')->url(self::publicCacheFileRelative($cacheFile));
    }

    public static function publicCacheFileRelative(string $cacheFile): string
    {
        return preg_replace(
            sprintf("#%s+#", DIRECTORY_SEPARATOR),
            DIRECTORY_SEPARATOR,
            str_replace(
                config('trfuniverse.public_cache_path'),
                'cache',
                $cacheFile
            )
        );
    }
}
