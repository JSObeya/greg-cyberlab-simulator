<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'activity_type',
        'activity_entity_id',
        'activity_entity_type',
        'order',
        'estimated_minutes',
        'is_mandatory',
        'points',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'estimated_minutes' => 'integer',
            'is_mandatory' => 'boolean',
            'points' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
