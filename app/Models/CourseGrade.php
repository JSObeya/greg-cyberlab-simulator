<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'cohort_id',
        'user_id',
        'labs_score',
        'quizzes_score',
        'assignments_score',
        'attendance_score',
        'final_score',
        'letter_grade',
        'status',
        'moderated_by',
        'moderated_at',
        'moderation_comments',
        'is_certificate_eligible',
    ];

    protected $casts = [
        'labs_score' => 'float',
        'quizzes_score' => 'float',
        'assignments_score' => 'float',
        'attendance_score' => 'float',
        'final_score' => 'float',
        'moderated_at' => 'datetime',
        'is_certificate_eligible' => 'boolean',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(Cohort::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
