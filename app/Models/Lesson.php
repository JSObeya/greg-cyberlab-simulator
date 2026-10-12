<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'module_id',
        'title',
        'slug',
        'summary',
        'objectives',
        'content',
        'order',
        'estimated_study_minutes',
        'video_embed_url',
        'video_provider',
        'audio_url',
        'is_free_preview',
        'drip_days',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'estimated_study_minutes' => 'integer',
            'is_free_preview' => 'boolean',
            'drip_days' => 'integer',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function laboratories(): HasMany
    {
        return $this->hasMany(Laboratory::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LearningActivity::class)->orderBy('order');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(LearningResource::class);
    }
}
