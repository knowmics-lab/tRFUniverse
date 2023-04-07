<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnalysisCanceled implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(private readonly string $batchId) {}

    public function broadcastOn(): Channel
    {
        return new Channel(sprintf('analysis.%s', $this->batchId));
    }

    public function broadcastAs(): string
    {
        return 'analysis.canceled';
    }
}
