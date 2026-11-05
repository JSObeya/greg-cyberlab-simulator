<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Programme extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'code',
        'department',
        'duration',
        'delivery_mode',
        'entry_requirements',
        'objectives',
        'coordinator_id',
        'status',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function cohorts(): HasMany
    {
        return $this->hasMany(Cohort::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'programme_user')
            ->withPivot('enrolled_at', 'status', 'notes')
            ->withTimestamps();
    }

    public function trainees(): BelongsToMany
    {
        return $this->users()->where('role', UserRole::TRAINEE);
    }
}
