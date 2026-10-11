<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Laboratory;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Display listing of courses for trainees and instructors.
     */
    public function index(): Response
    {
        $courses = Course::with(['modules.lessons.laboratories', 'cohorts'])
            ->where('is_published', true)
            ->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
        ]);
    }

    /**
     * Display course details with all modules, lessons, and laboratories.
     */
    public function show(Course $course): Response
    {
        $course->load([
            'modules.lessons.laboratories' => function ($query) {
                $query->where('status', 'published');
            },
            'cohorts',
        ]);

        return Inertia::render('Courses/Show', [
            'course' => $course,
        ]);
    }

    /**
     * Display lesson content.
     */
    public function lesson(Lesson $lesson): Response
    {
        $lesson->load(['module.course', 'laboratories']);

        return Inertia::render('Courses/Lesson', [
            'lesson' => $lesson,
            'module' => $lesson->module,
            'course' => $lesson->module->course,
        ]);
    }
}
