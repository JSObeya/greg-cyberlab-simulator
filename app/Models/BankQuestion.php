<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_bank_id',
        'type',
        'prompt',
        'explanation',
        'points',
        'difficulty',
        'options',
    ];

    protected $casts = [
        'options' => 'array',
        'points' => 'integer',
    ];

    public function questionBank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class);
    }
}
