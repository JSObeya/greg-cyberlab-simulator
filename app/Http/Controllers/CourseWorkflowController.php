<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseReview;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseWorkflowController extends Controller
{
    /**
     * Submit a draft course for review by the academic coordinator.
     */
    public function submitForReview(Request $request, Course $course): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isInstructor()) {
            abort(403, 'Unauthorized to submit course for review.');
        }

        $fromStatus = $course->status;
        $course->update(['status' => 'review']);

        CourseReview::create([
            'course_id' => $course->id,
            'user_id' => $user->id,
            'from_status' => $fromStatus,
            'to_status' => 'review',
            'comments' => $request->input('comments', 'Submitted for curriculum coordinator review.'),
        ]);

        AuditService::record('course_submitted_for_review', 'Course', $course->id, [
            'from' => $fromStatus,
            'to' => 'review',
        ]);

        return redirect()->back()->with('success', 'Course submitted for academic review.');
    }

    /**
     * Academic coordinator / admin approves and publishes the course.
     */
    public function approveAndPublish(Request $request, Course $course): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Only administrators or academic coordinators can approve course publication.');
        }

        $fromStatus = $course->status;
        $course->update([
            'status' => 'published',
            'is_published' => true,
            'approved_by' => $user->id,
            'published_at' => now(),
        ]);

        CourseReview::create([
            'course_id' => $course->id,
            'user_id' => $user->id,
            'from_status' => $fromStatus,
            'to_status' => 'published',
            'comments' => $request->input('comments', 'Course curriculum approved and published to Academy learners.'),
        ]);

        AuditService::record('course_published', 'Course', $course->id, [
            'approved_by' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Course curriculum approved and published successfully.');
    }

    /**
     * Request modifications or send back to draft.
     */
    public function requestChanges(Request $request, Course $course): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized to request changes.');
        }

        $validated = $request->validate([
            'comments' => 'required|string|min:10',
        ]);

        $fromStatus = $course->status;
        $course->update(['status' => 'draft']);

        CourseReview::create([
            'course_id' => $course->id,
            'user_id' => $user->id,
            'from_status' => $fromStatus,
            'to_status' => 'draft',
            'comments' => $validated['comments'],
        ]);

        AuditService::record('course_changes_requested', 'Course', $course->id, [
            'comments' => $validated['comments'],
        ]);

        return redirect()->back()->with('success', 'Curriculum modifications requested.');
    }
}
