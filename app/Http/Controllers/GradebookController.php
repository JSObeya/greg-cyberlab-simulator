<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\CourseGrade;
use App\Models\GradebookItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GradebookController extends Controller
{
    /**
     * Record daily attendance for a cohort session.
     */
    public function recordAttendance(Request $request, Cohort $cohort): JsonResponse
    {
        $user = Auth::user();
        $role = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;
        if (! in_array($role, ['super_admin', 'admin', 'instructor', 'academic_coordinator', 'teaching_assistant'])) {
            abort(403, 'Unauthorized to record attendance.');
        }

        $validated = $request->validate([
            'session_date' => 'required|date',
            'session_type' => 'required|string|in:lecture,lab,practical,webinar',
            'records' => 'required|array',
            'records.*.user_id' => 'required|exists:users,id',
            'records.*.status' => 'required|in:present,absent,late,excused',
            'records.*.remarks' => 'nullable|string',
        ]);

        foreach ($validated['records'] as $entry) {
            AttendanceRecord::updateOrCreate(
                [
                    'cohort_id' => $cohort->id,
                    'user_id' => $entry['user_id'],
                    'session_date' => $validated['session_date'],
                    'session_type' => $validated['session_type'],
                ],
                [
                    'course_id' => $cohort->course_id,
                    'recorded_by' => $user->id,
                    'status' => $entry['status'],
                    'remarks' => $entry['remarks'] ?? null,
                ]
            );
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'attendance_recorded',
            'entity_type' => AttendanceRecord::class,
            'payload' => [
                'cohort_id' => $cohort->id,
                'session_date' => $validated['session_date'],
                'record_count' => count($validated['records']),
            ],
        ]);

        return response()->json(['message' => 'Attendance recorded successfully.']);
    }

    /**
     * Compute and save final course grade for a trainee.
     */
    public function calculateGrade(Request $request, Course $course, User $trainee): JsonResponse
    {
        $user = Auth::user();
        $role = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;
        if (! in_array($role, ['super_admin', 'admin', 'instructor', 'academic_coordinator'])) {
            abort(403, 'Unauthorized to calculate grades.');
        }

        $validated = $request->validate([
            'labs_score' => 'required|numeric|min:0|max:100',
            'quizzes_score' => 'required|numeric|min:0|max:100',
            'assignments_score' => 'required|numeric|min:0|max:100',
            'attendance_score' => 'required|numeric|min:0|max:100',
        ]);

        // Default weighting: Labs (40%), Quizzes (20%), Assignments (30%), Attendance (10%)
        $finalScore = (
            ($validated['labs_score'] * 0.40) +
            ($validated['quizzes_score'] * 0.20) +
            ($validated['assignments_score'] * 0.30) +
            ($validated['attendance_score'] * 0.10)
        );

        $letterGrade = match (true) {
            $finalScore >= 80 => 'A',
            $finalScore >= 70 => 'B',
            $finalScore >= 60 => 'C',
            $finalScore >= 50 => 'D',
            default => 'F',
        };

        $isEligible = $finalScore >= $course->passing_score;

        $grade = CourseGrade::updateOrCreate(
            [
                'course_id' => $course->id,
                'user_id' => $trainee->id,
            ],
            [
                'labs_score' => $validated['labs_score'],
                'quizzes_score' => $validated['quizzes_score'],
                'assignments_score' => $validated['assignments_score'],
                'attendance_score' => $validated['attendance_score'],
                'final_score' => $finalScore,
                'letter_grade' => $letterGrade,
                'status' => 'submitted_for_moderation',
                'is_certificate_eligible' => $isEligible,
            ]
        );

        return response()->json([
            'message' => 'Grade calculated and submitted for moderation.',
            'grade' => $grade,
        ]);
    }

    /**
     * Academic Coordinator moderates and approves final grades.
     */
    public function moderateGrade(Request $request, CourseGrade $grade): RedirectResponse
    {
        $user = Auth::user();
        $role = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;
        if (! in_array($role, ['super_admin', 'admin', 'academic_coordinator'])) {
            abort(403, 'Unauthorized to moderate grades.');
        }

        $validated = $request->validate([
            'decision' => 'required|in:moderated,rejected',
            'moderation_comments' => 'nullable|string',
        ]);

        $status = $validated['decision'] === 'moderated' ? 'moderated' : 'draft';

        $grade->update([
            'status' => $status,
            'moderated_by' => $user->id,
            'moderated_at' => now(),
            'moderation_comments' => $validated['moderation_comments'] ?? null,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'grade_moderated',
            'entity_type' => CourseGrade::class,
            'entity_id' => $grade->id,
            'payload' => [
                'status' => $status,
                'moderator' => $user->id,
            ],
        ]);

        return back()->with('success', "Grade has been marked as {$status}.");
    }
}
