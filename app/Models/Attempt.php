<?php

namespace App\Models;

use App\Enums\AttemptStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attempt extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'laboratory_id',
        'cohort_id',
        'status',
        'started_at',
        'submitted_at',
        'raw_score',
        'penalties',
        'readiness_answers',
        'evidence_data',
        'autosaved_state',
        'rubric_scores',
        'safety_acknowledged_at',
        'policy_version',
        'final_score',
        'is_passed',
        'instructor_notes',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => AttemptStatus::class,
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'safety_acknowledged_at' => 'datetime',
            'is_passed' => 'boolean',
            'readiness_answers' => 'array',
            'evidence_data' => 'array',
            'autosaved_state' => 'array',
            'rubric_scores' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(Cohort::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function commands(): HasMany
    {
        return $this->hasMany(AttemptCommand::class);
    }
}
