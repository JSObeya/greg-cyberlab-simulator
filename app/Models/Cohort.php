<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cohort extends Model
{
    use SoftDeletes;
    protected $fillable = ['course_id', 'name', 'code', 'start_date', 'end_date', 'is_active'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('enrolled_at');
    }
}
