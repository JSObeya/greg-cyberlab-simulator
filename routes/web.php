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

    // Course Publication Approval Workflow
    Route::post('/courses/{course}/submit-review', [\App\Http\Controllers\CourseWorkflowController::class, 'submitForReview'])->name('courses.submit-review');
    Route::post('/courses/{course}/approve-publish', [\App\Http\Controllers\CourseWorkflowController::class, 'approveAndPublish'])->name('courses.approve-publish');
    Route::post('/courses/{course}/request-changes', [\App\Http\Controllers\CourseWorkflowController::class, 'requestChanges'])->name('courses.request-changes');

    // Learning Resources Upload & Protected Streaming
    Route::post('/lessons/{lesson}/resources', [\App\Http\Controllers\LearningResourceController::class, 'store'])->name('resources.store');
    Route::get('/resources/{resource}/download', [\App\Http\Controllers\LearningResourceController::class, 'download'])->name('resources.download');

    // Trainee Progress Tracking (Phase 4)
    Route::post('/lessons/{lesson}/progress', [\App\Http\Controllers\ProgressController::class, 'updateLessonProgress'])->name('lessons.progress');

    // Community, Announcements & Discussions (Phase 4)
    Route::post('/courses/{course}/announcements', [\App\Http\Controllers\CommunityController::class, 'storeAnnouncement'])->name('courses.announcements.store');
    Route::post('/courses/{course}/discussions', [\App\Http\Controllers\CommunityController::class, 'storeDiscussion'])->name('courses.discussions.store');
    Route::post('/discussions/{discussion}/reply', [\App\Http\Controllers\CommunityController::class, 'storeDiscussionPost'])->name('discussions.reply');

    // Assessment Engine: Quizzes (Phase 5)
    Route::post('/quizzes/{quiz}/attempt', [\App\Http\Controllers\QuizController::class, 'startAttempt'])->name('quizzes.attempt');
    Route::post('/quiz-attempts/{attempt}/autosave', [\App\Http\Controllers\QuizController::class, 'autosave'])->name('quizzes.autosave');
    Route::post('/quiz-attempts/{attempt}/submit', [\App\Http\Controllers\QuizController::class, 'submitAttempt'])->name('quizzes.submit');

    // Assessment Engine: Assignments (Phase 5)
    Route::post('/assignments/{assignment}/submit', [\App\Http\Controllers\AssignmentController::class, 'submit'])->name('assignments.submit');
    Route::post('/assignment-submissions/{submission}/grade', [\App\Http\Controllers\AssignmentController::class, 'grade'])->name('assignments.grade');
    Route::get('/assignment-submissions/{submission}/download', [\App\Http\Controllers\AssignmentController::class, 'download'])->name('assignments.download');

    // Attendance, Gradebook & Academic Moderation (Phase 6 & 7)
    Route::post('/cohorts/{cohort}/attendance', [\App\Http\Controllers\GradebookController::class, 'recordAttendance'])->name('cohorts.attendance.record');
    Route::post('/courses/{course}/grades/{trainee}/calculate', [\App\Http\Controllers\GradebookController::class, 'calculateGrade'])->name('grades.calculate');
    Route::post('/grades/{grade}/moderate', [\App\Http\Controllers\GradebookController::class, 'moderateGrade'])->name('grades.moderate');

    // Academic Programmes Management
    Route::get('/admin/programmes', [\App\Http\Controllers\ProgrammeController::class, 'index'])->name('admin.programmes.index');
    Route::post('/admin/programmes', [\App\Http\Controllers\ProgrammeController::class, 'store'])->name('admin.programmes.store');
    Route::put('/admin/programmes/{programme}', [\App\Http\Controllers\ProgrammeController::class, 'update'])->name('admin.programmes.update');

    // Cohort & Enrollment Management
    Route::get('/cohorts', [CohortController::class, 'index'])->name('cohorts.index');
    Route::post('/cohorts', [CohortController::class, 'store'])->name('cohorts.store');
    Route::post('/cohorts/{cohort}/enroll', [CohortController::class, 'enroll'])->name('cohorts.enroll');

    // Simulation Lab Arena
    Route::get('/labs/{laboratory:slug}', [SimulationController::class, 'show'])->name('simulation.show');
    Route::post('/attempts/{attempt}/command', [SimulationController::class, 'executeCommand'])
        ->middleware('throttle:60,1')
        ->name('simulation.command');
    Route::post('/attempts/{attempt}/autosave', [SimulationController::class, 'autosave'])->name('simulation.autosave');
    Route::post('/attempts/{attempt}/acknowledge-safety', [SimulationController::class, 'acknowledgeSafety'])->name('simulation.acknowledge-safety');
    Route::post('/attempts/{attempt}/reset', [SimulationController::class, 'reset'])->name('simulation.reset');
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
