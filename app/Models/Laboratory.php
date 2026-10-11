<?php

namespace App\Models;

use App\Enums\LabStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Laboratory extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'lesson_id',
        'course_id',
        'title',
        'slug',
        'category',
        'difficulty',
        'estimated_minutes',
        'passing_score',
        'max_attempts',
        'status',
        'scenario_background',
        'learning_objectives',
        'safety_notice',
        'instructions',
        'expected_findings',
        'remediation_explanation',
        'instructor_guide',
        'workbench_config',
    ];

    protected function casts(): array
    {
        return [
            'status' => LabStatus::class,
            'workbench_config' => 'array',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function scenario(): HasOne
    {
        return $this->hasOne(Scenario::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }
}
