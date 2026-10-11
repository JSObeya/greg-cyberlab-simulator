<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttemptCommand extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'attempt_id',
        'command',
        'was_allowed',
        'simulated_output',
        'executed_at',
    ];

    protected function casts(): array
    {
        return [
            'was_allowed' => 'boolean',
            'executed_at' => 'datetime',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(Attempt::class);
    }
}
