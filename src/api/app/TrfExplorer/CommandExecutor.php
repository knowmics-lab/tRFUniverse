<?php

namespace App\TrfExplorer;

use App\Exceptions\IgnoredException;
use App\Traits\Makeable;
use ArrayAccess;
use Illuminate\Support\Facades\Log;
use JsonSerializable;
use Stringable;
use Symfony\Component\Process\Exception\ProcessFailedException;

class CommandExecutor
{

    public const IGNORED_ERROR_CODE = Utils::IGNORED_ERROR_CODE;

    use Makeable;

    /**
     * @param  array<string>  $command
     * @param  array<int, string>  $errorCodesMap
     * @param  string|null  $cwd
     * @param  int|null  $timeout
     * @param  bool  $log
     */
    public function __construct(
        private array $command = [],
        private array $errorCodesMap = [],
        private ?string $cwd = null,
        private ?int $timeout = null,
        private bool $log = false,
    ) {}

    public static function forScript(string $scriptName, string $extension = '.R'): static
    {
        return static::make()->withScript($scriptName, $extension);
    }

    public function withScript(string $scriptName, string $extension = '.R'): self
    {
        $this->command = ['Rscript', Utils::scriptPath($scriptName, $extension)];

        return $this;
    }

    public static function forCommand(string $command): static
    {
        return static::make()->withCommand($command);
    }

    public function withCommand(string $commandName): self
    {
        $this->command = [$commandName];

        return $this;
    }

    public function withCwd(string $cwd): self
    {
        $this->cwd = $cwd;

        return $this;
    }

    public function withTimeout(int $timeout): self
    {
        $this->timeout = $timeout;

        return $this;
    }

    public function withErrorCodesMap(array $errorCodesMap): self
    {
        $this->errorCodesMap = $errorCodesMap;

        return $this;
    }

    public function withErrorCode(int $errorCode, string $message): self
    {
        $this->errorCodesMap[$errorCode] = $message;

        return $this;
    }

    public function withIgnoredErrorCode(int $errorCode): self
    {
        $this->errorCodesMap[$errorCode] = self::IGNORED_ERROR_CODE;

        return $this;
    }

    public function withRepeatedArguments(string $argument, array $values): self
    {
        foreach ($values as $value) {
            $this->withArguments($argument, $value);
        }

        return $this;
    }

    public function withArguments(string|int|float|array|ArrayAccess|JsonSerializable|Stringable ...$parameters): self
    {
        foreach ($parameters as $parameter) {
            if (is_array($parameter) || $parameter instanceof ArrayAccess) {
                $this->withArguments(...$parameter);
            } elseif ($parameter instanceof JsonSerializable) {
                $this->command[] = $parameter->jsonSerialize();
            } elseif ($parameter instanceof Stringable) {
                $this->command[] = $parameter->__toString();
            } else {
                $this->command[] = (string)$parameter;
            }
        }

        return $this;
    }

    public function withConditionalArguments(bool $condition, ...$parameters): self
    {
        return $this->when($condition, static fn(self $t) => $t->withArguments(...$parameters));
    }

    public function when(bool|callable $condition, callable $callback): self
    {
        if (is_callable($condition)) {
            $condition = $condition();
        }

        if ($condition) {
            $callback($this);
        }

        return $this;
    }

    public function withFlag(string $flag, bool $condition = true): self
    {
        return $this->when($condition, static fn(self $t) => $t->withArguments($flag));
    }

    public function withoutLogFile(): self
    {
        $this->log = false;

        return $this;
    }

    public function withLogFile(): self
    {
        $this->log = true;

        return $this;
    }

    public function getCommand(): array
    {
        return $this->command;
    }

    /**
     * @throws \App\Exceptions\ProcessingJobException
     * @throws \App\Exceptions\IgnoredException
     */
    public function execute(?callable $callback = null): string|null
    {
        try {
            return Utils::runCommand($this->command, $this->cwd, $this->timeout, $callback);
        } catch (ProcessFailedException $e) {
            $mappedException = Utils::mapCommandException($e, $this->errorCodesMap);
            if ($mappedException instanceof IgnoredException) {
                return null;
            }
            if ($this->log) {
                Log::error(
                    $mappedException->getMessage(),
                    [
                        'error_code'         => $mappedException->getCode(),
                        'original_exception' => $e,
                    ]
                );
            }
            throw $mappedException;
        }
    }

    public function dump(): self
    {
        /** @noinspection ForgottenDebugOutputInspection */
        dump($this->command);

        return $this;
    }

}