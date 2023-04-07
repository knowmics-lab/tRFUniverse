<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnalysisCompleted implements ShouldBroadcast
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
        return 'analysis.completed';
    }
}
