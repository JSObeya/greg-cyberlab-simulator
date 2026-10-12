<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'bank_question_id',
        'prompt',
        'type',
        'points',
        'order',
        'options',
        'explanation',
    ];

    protected $casts = [
        'points' => 'integer',
        'order' => 'integer',
        'options' => 'array',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function bankQuestion(): BelongsTo
    {
        return $this->belongsTo(BankQuestion::class);
    }
}
