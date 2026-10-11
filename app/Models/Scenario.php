<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scenario extends Model
{
    protected $fillable = [
        'laboratory_id',
        'title',
        'initial_state',
        'network_topology',
        'allowed_commands',
    ];

    protected function casts(): array
    {
        return [
            'initial_state' => 'array',
            'network_topology' => 'array',
            'allowed_commands' => 'array',
        ];
    }

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }
}
