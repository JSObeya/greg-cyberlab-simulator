<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Programme;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Display listing of courses for trainees and instructors.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $canManage = $user && ($user->isAdmin() || $user->isAcademicCoordinator() || $user->isInstructor());

        $coursesQuery = Course::with(['modules.lessons.laboratories', 'cohorts', 'programme', 'instructors']);

        if (! $canManage) {
            $coursesQuery->where('is_published', true);
        }

        $courses = $coursesQuery->latest()->get();

        $programmes = Programme::select('id', 'title', 'code')->get();
        $instructors = User::whereIn('role', ['instructor', 'academic_coordinator', 'teaching_assistant', 'admin', 'super_admin'])
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'programmes' => $programmes,
            'instructors' => $instructors,
            'canManage' => $canManage,
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator() && ! $user->isInstructor()) {
            abort(403, 'Unauthorized to create courses.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'programme_id' => 'nullable|exists:programmes,id',
            'summary' => 'nullable|string|max:1000',
            'description' => 'required|string',
            'level' => 'required|string|in:beginner,intermediate,advanced,all_levels',
            'credit_hours' => 'nullable|integer|min:1|max:120',
            'estimated_duration_hours' => 'nullable|integer|min:1|max:1000',
            'passing_score' => 'nullable|integer|min:1|max:100',
            'status' => 'nullable|string|in:draft,review,published,archived',
            'is_published' => 'nullable|boolean',
            'instructor_ids' => 'nullable|array',
            'instructor_ids.*' => 'exists:users,id',
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug ?: 'course';
        $count = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$count++;
        }

        $isPublished = ($validated['status'] ?? 'published') === 'published' || $request->boolean('is_published');

        $course = Course::create([
            'programme_id' => $validated['programme_id'] ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'code' => $validated['code'] ?? null,
            'summary' => $validated['summary'] ?? null,
            'description' => $validated['description'],
            'level' => $validated['level'],
            'credit_hours' => $validated['credit_hours'] ?? 3,
            'estimated_duration_hours' => $validated['estimated_duration_hours'] ?? 40,
            'passing_score' => $validated['passing_score'] ?? 70,
            'status' => $validated['status'] ?? ($isPublished ? 'published' : 'draft'),
            'is_published' => $isPublished,
            'created_by' => $user->id,
            'approved_by' => $isPublished && ($user->isAdmin() || $user->isAcademicCoordinator()) ? $user->id : null,
            'published_at' => $isPublished ? now() : null,
        ]);

        if (! empty($validated['instructor_ids'])) {
            $course->instructors()->sync($validated['instructor_ids']);
        }

        AuditService::record('course_created', 'Course', $course->id, $validated);

        return redirect()->back()->with('success', 'Course curriculum established successfully.');
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator() && ! $user->isInstructor()) {
            abort(403, 'Unauthorized to update courses.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'programme_id' => 'nullable|exists:programmes,id',
            'summary' => 'nullable|string|max:1000',
            'description' => 'required|string',
            'level' => 'required|string|in:beginner,intermediate,advanced,all_levels',
            'credit_hours' => 'nullable|integer|min:1|max:120',
            'estimated_duration_hours' => 'nullable|integer|min:1|max:1000',
            'passing_score' => 'nullable|integer|min:1|max:100',
            'status' => 'nullable|string|in:draft,review,published,archived',
            'is_published' => 'nullable|boolean',
            'instructor_ids' => 'nullable|array',
            'instructor_ids.*' => 'exists:users,id',
        ]);

        $isPublished = array_key_exists('is_published', $validated)
            ? (bool) $validated['is_published']
            : (($validated['status'] ?? $course->status) === 'published');

        $updateData = [
            'programme_id' => $validated['programme_id'] ?? null,
            'title' => $validated['title'],
            'code' => $validated['code'] ?? null,
            'summary' => $validated['summary'] ?? null,
            'description' => $validated['description'],
            'level' => $validated['level'],
            'credit_hours' => $validated['credit_hours'] ?? $course->credit_hours,
            'estimated_duration_hours' => $validated['estimated_duration_hours'] ?? $course->estimated_duration_hours,
            'passing_score' => $validated['passing_score'] ?? $course->passing_score,
            'status' => $validated['status'] ?? $course->status,
            'is_published' => $isPublished,
        ];

        if ($isPublished && ! $course->is_published) {
            $updateData['published_at'] = now();
            if ($user->isAdmin() || $user->isAcademicCoordinator()) {
                $updateData['approved_by'] = $user->id;
            }
        }

        $course->update($updateData);

        if (array_key_exists('instructor_ids', $validated)) {
            $course->instructors()->sync($validated['instructor_ids'] ?? []);
        }

        AuditService::record('course_updated', 'Course', $course->id, $validated);

        return redirect()->back()->with('success', 'Course curriculum updated successfully.');
    }

    /**
     * Display course details with all modules, lessons, and laboratories.
     */
    public function show(Course $course): Response
    {
        $course->load([
            'programme',
            'instructors',
            'modules.lessons.laboratories' => function ($query) {
                $query->where('status', 'published');
            },
            'modules.lessons.resources',
            'modules.lessons.activities',
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
        $lesson->load([
            'module.course.programme',
            'laboratories',
            'resources.uploader',
            'activities',
        ]);

        return Inertia::render('Courses/Lesson', [
            'lesson' => $lesson,
            'module' => $lesson->module,
            'course' => $lesson->module->course,
        ]);
    }
}
