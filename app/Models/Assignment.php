<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assignment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_id',
        'lesson_id',
        'title',
        'slug',
        'instructions',
        'total_points',
        'due_date',
        'cutoff_date',
        'max_file_size_mb',
        'allowed_extensions',
        'rubric',
        'is_published',
    ];

    protected $casts = [
        'total_points' => 'integer',
        'max_file_size_mb' => 'integer',
        'due_date' => 'datetime',
        'cutoff_date' => 'datetime',
        'rubric' => 'array',
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

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
