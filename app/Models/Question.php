<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    protected $fillable = [
        'laboratory_id',
        'type',
        'prompt',
        'points',
        'order',
        'options',
        'correct_answer_explanation',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }
}
