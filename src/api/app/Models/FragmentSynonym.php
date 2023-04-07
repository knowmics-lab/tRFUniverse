<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Kirschbaum\PowerJoins\PowerJoins;
use Laravel\Scout\Searchable;

class FragmentSynonym extends Model
{
    use PowerJoins;
    use Searchable;

    protected $fillable = [
        'fragment_id',
        'synonym',
    ];

    public function fragment(): BelongsTo
    {
        return $this->belongsTo(Fragment::class);
    }

    public function toSearchableArray(): array
    {
        return [
            'synonym' => $this->synonym,
        ];
    }
}
