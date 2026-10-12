<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'programme_id',
        'title',
        'slug',
        'code',
        'summary',
        'description',
        'level',
        'credit_hours',
        'estimated_duration_hours',
        'passing_score',
        'status',
        'created_by',
        'approved_by',
        'published_at',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'credit_hours' => 'integer',
            'estimated_duration_hours' => 'integer',
            'passing_score' => 'integer',
        ];
    }

    public function programme(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Programme::class);
    }

    public function instructors(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_instructors')
            ->withPivot('is_primary', 'assigned_at')
            ->withTimestamps();
    }

    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function cohorts(): HasMany
    {
        return $this->hasMany(Cohort::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function laboratories(): HasMany
    {
        return $this->hasMany(Laboratory::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->is_published;
    }

    public function isUnderReview(): bool
    {
        return $this->status === 'review';
    }
}
