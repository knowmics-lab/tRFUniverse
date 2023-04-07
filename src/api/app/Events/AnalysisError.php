<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnalysisError implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        private readonly string $batchId,
        private readonly string $error,
        private readonly string $trace
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel(sprintf('analysis.%s', $this->batchId));
    }

    public function broadcastAs(): string
    {
        return 'analysis.error';
    }

    public function broadcastWith(): array
    {
        return [
            'error' => $this->error,
            'trace' => $this->trace,
        ];
    }
}
