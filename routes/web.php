<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CohortController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SimulationController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Public Certificate Verification
Route::get('/verify/{token}', [CertificateController::class, 'verify'])->name('certificate.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    // Role-routed Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Courses & Curriculum (Phase 3 Learning Management)
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/lessons/{lesson:slug}', [CourseController::class, 'lesson'])->name('lessons.show');

    // Cohort & Enrollment Management
    Route::get('/cohorts', [CohortController::class, 'index'])->name('cohorts.index');
    Route::post('/cohorts', [CohortController::class, 'store'])->name('cohorts.store');
    Route::post('/cohorts/{cohort}/enroll', [CohortController::class, 'enroll'])->name('cohorts.enroll');

    // Simulation Lab Arena
    Route::get('/labs/{laboratory:slug}', [SimulationController::class, 'show'])->name('simulation.show');
    Route::post('/attempts/{attempt}/command', [SimulationController::class, 'executeCommand'])
        ->middleware('throttle:60,1')
        ->name('simulation.command');
    Route::post('/attempts/{attempt}/submit', [SimulationController::class, 'submitAttempt'])->name('simulation.submit');
    Route::get('/attempts/{attempt}/result', [SimulationController::class, 'result'])->name('simulation.result');

    // Reports & CSV Export
    Route::get('/reports/export', [CertificateController::class, 'exportCsv'])->name('reports.export');

    // System Audit Trail Viewer
    Route::get('/admin/audit-logs', [AuditLogController::class, 'index'])->name('admin.audit-logs');

    // User & Credential Management (Admins)
    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
