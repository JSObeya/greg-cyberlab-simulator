<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_id',
        'lesson_id',
        'title',
        'slug',
        'instructions',
        'time_limit_minutes',
        'passing_score_percentage',
        'max_attempts',
        'randomize_questions',
        'randomize_options',
        'show_correct_answers_after',
        'is_published',
    ];

    protected $casts = [
        'time_limit_minutes' => 'integer',
        'passing_score_percentage' => 'integer',
        'max_attempts' => 'integer',
        'randomize_questions' => 'boolean',
        'randomize_options' => 'boolean',
        'show_correct_answers_after' => 'boolean',
        'is_published' => 'boolean',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
