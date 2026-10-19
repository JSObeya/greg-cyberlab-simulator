<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CohortController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseWorkflowController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradebookController;
use App\Http\Controllers\LearningResourceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgrammeController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\QuizController;
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
    Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
    Route::put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/lessons/{lesson:slug}', [CourseController::class, 'lesson'])->name('lessons.show');

    // Course Publication Approval Workflow
    Route::post('/courses/{course}/submit-review', [CourseWorkflowController::class, 'submitForReview'])->name('courses.submit-review');
    Route::post('/courses/{course}/approve-publish', [CourseWorkflowController::class, 'approveAndPublish'])->name('courses.approve-publish');
    Route::post('/courses/{course}/request-changes', [CourseWorkflowController::class, 'requestChanges'])->name('courses.request-changes');

    // Learning Resources Upload & Protected Streaming
    Route::post('/lessons/{lesson}/resources', [LearningResourceController::class, 'store'])->name('resources.store');
    Route::get('/resources/{resource}/download', [LearningResourceController::class, 'download'])->name('resources.download');

    // Trainee Progress Tracking (Phase 4)
    Route::post('/lessons/{lesson}/progress', [ProgressController::class, 'updateLessonProgress'])->name('lessons.progress');

    // Community, Announcements & Discussions (Phase 4)
    Route::post('/courses/{course}/announcements', [CommunityController::class, 'storeAnnouncement'])->name('courses.announcements.store');
    Route::post('/courses/{course}/discussions', [CommunityController::class, 'storeDiscussion'])->name('courses.discussions.store');
    Route::post('/discussions/{discussion}/reply', [CommunityController::class, 'storeDiscussionPost'])->name('discussions.reply');

    // Assessment Engine: Quizzes (Phase 5)
    Route::post('/quizzes/{quiz}/attempt', [QuizController::class, 'startAttempt'])->name('quizzes.attempt');
    Route::post('/quiz-attempts/{attempt}/autosave', [QuizController::class, 'autosave'])->name('quizzes.autosave');
    Route::post('/quiz-attempts/{attempt}/submit', [QuizController::class, 'submitAttempt'])->name('quizzes.submit');

    // Assessment Engine: Assignments (Phase 5)
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->name('assignments.submit');
    Route::post('/assignment-submissions/{submission}/grade', [AssignmentController::class, 'grade'])->name('assignments.grade');
    Route::get('/assignment-submissions/{submission}/download', [AssignmentController::class, 'download'])->name('assignments.download');

    // Attendance, Gradebook & Academic Moderation (Phase 6 & 7)
    Route::post('/cohorts/{cohort}/attendance', [GradebookController::class, 'recordAttendance'])->name('cohorts.attendance.record');
    Route::post('/courses/{course}/grades/{trainee}/calculate', [GradebookController::class, 'calculateGrade'])->name('grades.calculate');
    Route::post('/grades/{grade}/moderate', [GradebookController::class, 'moderateGrade'])->name('grades.moderate');

    // Academic Programmes Management
    Route::get('/admin/programmes', [ProgrammeController::class, 'index'])->name('admin.programmes.index');
    Route::post('/admin/programmes', [ProgrammeController::class, 'store'])->name('admin.programmes.store');
    Route::put('/admin/programmes/{programme}', [ProgrammeController::class, 'update'])->name('admin.programmes.update');

    // Cohort & Enrollment Management
    Route::get('/cohorts', [CohortController::class, 'index'])->name('cohorts.index');
    Route::post('/cohorts', [CohortController::class, 'store'])->name('cohorts.store');
    Route::put('/cohorts/{cohort}', [CohortController::class, 'update'])->name('cohorts.update');
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
    Route::post('/admin/users/import-csv', [UserController::class, 'importCsv'])->name('admin.users.import-csv');
    Route::get('/admin/users/sample-csv', [UserController::class, 'downloadSampleCsv'])->name('admin.users.sample-csv');
    Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
