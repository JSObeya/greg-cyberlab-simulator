<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradebookItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'item_type',
        'item_id',
        'max_points',
        'weight_percentage',
    ];

    protected $casts = [
        'max_points' => 'integer',
        'weight_percentage' => 'float',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
