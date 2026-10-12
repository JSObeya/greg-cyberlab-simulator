<?php

namespace App\Http\Controllers;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Badge;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Laboratory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        if ($user->isAdmin() || $user->isAcademicCoordinator()) {
            return Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'totalUsers' => User::count(),
                    'trainees' => User::where('role', 'trainee')->count(),
                    'instructors' => User::where('role', 'instructor')->count(),
                    'courses' => Course::count(),
                    'publishedLabs' => Laboratory::where('status', 'published')->count(),
                    'totalAttempts' => Attempt::count(),
                    'passedAttempts' => Attempt::where('is_passed', true)->count(),
                ],
                'recentAttempts' => Attempt::with(['user', 'laboratory'])
                    ->latest()
                    ->take(6)
                    ->get(),
            ]);
        }

        if ($user->isInstructor() || $user->isTeachingAssistant()) {
            return Inertia::render('Instructor/Dashboard', [
                'stats' => [
                    'activeLabs' => Laboratory::where('status', 'published')->count(),
                    'totalSubmissions' => Attempt::where('status', 'submitted')->count(),
                    'pendingReviews' => Attempt::where('status', 'under_review')->count(),
                ],
                'recentSubmissions' => Attempt::with(['user', 'laboratory'])
                    ->latest()
                    ->take(10)
                    ->get(),
            ]);
        }

        // Trainee Dashboard
        $attempts = Attempt::where('user_id', $user->id)->with('laboratory')->get();
        $passedCount = $attempts->where('is_passed', true)->count();
        $totalLabs = Laboratory::where('status', 'published')->count();
        $progressPercentage = $totalLabs > 0 ? (int) round(($passedCount / $totalLabs) * 100) : 0;

        return Inertia::render('Trainee/Dashboard', [
            'enrolledCourses' => Course::with('modules.lessons.laboratories')->where('is_published', true)->get(),
            'attempts' => $attempts,
            'progress' => [
                'passedLabs' => $passedCount,
                'totalLabs' => $totalLabs,
                'percentage' => $progressPercentage,
            ],
            'badges' => $user->badges,
            'certificates' => $user->certificates()->with('course')->get(),
        ]);
    }
}
