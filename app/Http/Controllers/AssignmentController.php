<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssignmentController extends Controller
{
    /**
     * Submit an assignment file (up to 60MB).
     */
    public function submit(Request $request, Assignment $assignment): RedirectResponse
    {
        $user = Auth::user();

        // Check cutoff date
        if ($assignment->cutoff_date && now()->isAfter($assignment->cutoff_date)) {
            return back()->with('error', 'The submission cutoff deadline for this assignment has passed.');
        }

        $validated = $request->validate([
            'file' => 'required|file|max:61440|mimes:pdf,docx,zip,txt', // 60MB limit per user rule
            'student_notes' => 'nullable|string|max:2000',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $storedPath = $file->store('private/assignment_submissions');

        // Check existing submissions for versioning
        $latestSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->latest('version')
            ->first();

        $version = $latestSubmission ? $latestSubmission->version + 1 : 1;
        $status = ($assignment->due_date && now()->isAfter($assignment->due_date)) ? 'late' : 'submitted';

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'user_id' => $user->id,
            'version' => $version,
            'student_notes' => $validated['student_notes'] ?? null,
            'file_path' => $storedPath,
            'file_name' => $fileName,
            'file_size_bytes' => $file->getSize(),
            'status' => $status,
            'submitted_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'assignment_submitted',
            'entity_type' => AssignmentSubmission::class,
            'entity_id' => $submission->id,
            'payload' => [
                'assignment_id' => $assignment->id,
                'version' => $version,
                'file_name' => $fileName,
            ],
        ]);

        return back()->with('success', "Assignment version {$version} submitted successfully.");
    }

    /**
     * Grade an assignment submission with rubric breakdown.
     */
    public function grade(Request $request, AssignmentSubmission $submission): RedirectResponse
    {
        $user = Auth::user();
        $role = $user->role instanceof \App\Enums\UserRole ? $user->role->value : (string) $user->role;
        if (! in_array($role, ['super_admin', 'admin', 'instructor', 'academic_coordinator'])) {
            abort(403, 'Unauthorized to grade assignments.');
        }

        $validated = $request->validate([
            'awarded_score' => 'required|integer|min:0|max:100',
            'instructor_feedback' => 'nullable|string',
            'rubric_breakdown' => 'nullable|array',
        ]);

        $submission->update([
            'awarded_score' => $validated['awarded_score'],
            'instructor_feedback' => $validated['instructor_feedback'] ?? null,
            'rubric_breakdown' => $validated['rubric_breakdown'] ?? null,
            'status' => 'graded',
            'graded_by' => $user->id,
            'graded_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'assignment_graded',
            'entity_type' => AssignmentSubmission::class,
            'entity_id' => $submission->id,
            'payload' => [
                'awarded_score' => $validated['awarded_score'],
                'graded_by' => $user->id,
            ],
        ]);

        return back()->with('success', 'Assignment submission graded successfully.');
    }

    /**
     * Download an assignment submission file securely.
     */
    public function download(AssignmentSubmission $submission): StreamedResponse
    {
        $user = Auth::user();

        // Trainee can download their own submission; Instructors/Admins can download any
        $isAuthor = $submission->user_id === $user->id;
        $role = $user->role instanceof \App\Enums\UserRole ? $user->role->value : (string) $user->role;
        $isStaff = in_array($role, ['super_admin', 'admin', 'instructor', 'academic_coordinator']);

        if (! $isAuthor && ! $isStaff) {
            abort(403, 'Unauthorized access to submission file.');
        }

        if (! Storage::exists($submission->file_path)) {
            abort(404, 'File not found on server.');
        }

        return Storage::download($submission->file_path, $submission->file_name);
    }
}
