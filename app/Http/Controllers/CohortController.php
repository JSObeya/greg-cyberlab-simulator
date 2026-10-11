<?php

namespace App\Http\Controllers;

use App\Models\Cohort;
use App\Models\Course;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CohortController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isInstructor()) {
            abort(403, 'Unauthorized access to cohort management.');
        }

        $cohorts = Cohort::with(['course', 'users'])->latest()->get();
        $courses = Course::select('id', 'title')->get();

        return Inertia::render('Cohorts/Index', [
            'cohorts' => $cohorts,
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin()) {
            abort(403, 'Only administrators can create cohorts.');
        }

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:cohorts,code',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $cohort = Cohort::create($validated);

        AuditService::record('cohort_created', 'Cohort', $cohort->id, $validated);

        return redirect()->back()->with('success', 'Cohort successfully established.');
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
