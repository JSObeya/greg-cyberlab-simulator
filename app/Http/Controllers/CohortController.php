<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\Programme;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CohortController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isInstructor() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized access to cohort management.');
        }

        $cohorts = Cohort::with(['course', 'programme', 'academicSession', 'instructors', 'users'])->latest()->get();
        $courses = Course::select('id', 'title', 'programme_id')->get();
        $programmes = Programme::select('id', 'title', 'code')->get();
        $sessions = AcademicSession::select('id', 'name', 'code')->get();
        $instructors = User::whereIn('role', ['instructor', 'academic_coordinator', 'teaching_assistant', 'admin'])
            ->select('id', 'name', 'email')
            ->get();
        $trainees = User::where('role', 'trainee')->select('id', 'name', 'email')->get();

        return Inertia::render('Cohorts/Index', [
            'cohorts' => $cohorts,
            'courses' => $courses,
            'programmes' => $programmes,
            'sessions' => $sessions,
            'instructors' => $instructors,
            'trainees' => $trainees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Only administrators or academic coordinators can create cohorts.');
        }

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'programme_id' => 'nullable|exists:programmes,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:cohorts,code',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'max_capacity' => 'nullable|integer|min:1',
            'instructor_ids' => 'nullable|array',
            'instructor_ids.*' => 'exists:users,id',
        ]);

        $cohort = Cohort::create([
            'course_id' => $validated['course_id'],
            'programme_id' => $validated['programme_id'] ?? null,
            'academic_session_id' => $validated['academic_session_id'] ?? null,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'max_capacity' => $validated['max_capacity'] ?? 30,
            'status' => 'active',
            'is_active' => true,
        ]);

        if (! empty($validated['instructor_ids'])) {
            $cohort->instructors()->sync($validated['instructor_ids']);
        }

        AuditService::record('cohort_created', 'Cohort', $cohort->id, $validated);

        return redirect()->back()->with('success', 'Cohort successfully established.');
    }

    public function update(Request $request, Cohort $cohort): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator() && ! $user->isInstructor()) {
            abort(403, 'Only administrators, academic coordinators, or instructors can update cohorts.');
        }

        if ($request->input('programme_id') === '' || $request->input('programme_id') === 'null') {
            $request->merge(['programme_id' => null]);
        }

        if ($request->input('academic_session_id') === '' || $request->input('academic_session_id') === 'null') {
            $request->merge(['academic_session_id' => null]);
        }

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'programme_id' => 'nullable|exists:programmes,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('cohorts', 'code')->ignore($cohort->id)],
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'max_capacity' => 'nullable|integer|min:1',
            'status' => 'nullable|string|in:active,completed,archived,upcoming',
            'is_active' => 'nullable|boolean',
            'instructor_ids' => 'nullable|array',
            'instructor_ids.*' => 'exists:users,id',
        ]);

        $cohort->update([
            'course_id' => $validated['course_id'],
            'programme_id' => $validated['programme_id'] ?? null,
            'academic_session_id' => $validated['academic_session_id'] ?? null,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'max_capacity' => $validated['max_capacity'] ?? $cohort->max_capacity,
            'status' => $validated['status'] ?? $cohort->status ?? 'active',
            'is_active' => $request->has('is_active') ? (bool) $validated['is_active'] : $cohort->is_active,
        ]);

        if (array_key_exists('instructor_ids', $validated)) {
            $cohort->instructors()->sync($validated['instructor_ids'] ?? []);
        }

        AuditService::record('cohort_updated', 'Cohort', $cohort->id, $validated);

        return redirect()->back()->with('success', 'Cohort updated successfully.');
    }

    public function enroll(Request $request, Cohort $cohort): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isInstructor()) {
            abort(403, 'Unauthorized to manage cohort enrollments.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $cohort->users()->syncWithoutDetaching([$validated['user_id']]);

        AuditService::record('trainee_enrolled', 'Cohort', $cohort->id, [
            'enrolled_user_id' => $validated['user_id'],
        ]);

        return redirect()->back()->with('success', 'Trainee enrolled successfully.');
    }
}
