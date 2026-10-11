<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;
    protected $fillable = ['programme_id', 'title', 'slug', 'description', 'level', 'is_published'];

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
}
