<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Discussion;
use App\Models\DiscussionPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommunityController extends Controller
{
    /**
     * Store a course or cohort announcement.
     */
    public function storeAnnouncement(Request $request, Course $course): RedirectResponse
    {
        $user = Auth::user();
        $role = $user->role instanceof \App\Enums\UserRole ? $user->role->value : (string) $user->role;
        if (! in_array($role, ['super_admin', 'admin', 'instructor', 'academic_coordinator'])) {
            abort(403, 'Unauthorized to post announcements.');
        }

        $validated = $request->validate([
            'cohort_id' => 'nullable|exists:cohorts,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,normal,urgent',
            'is_pinned' => 'boolean',
        ]);

        $announcement = Announcement::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'cohort_id' => $validated['cohort_id'] ?? null,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'priority' => $validated['priority'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'published_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'announcement_created',
            'entity_type' => Announcement::class,
            'entity_id' => $announcement->id,
            'payload' => ['course_id' => $course->id, 'title' => $announcement->title],
        ]);

        return back()->with('success', 'Announcement published successfully.');
    }

    /**
     * Start a new discussion thread.
     */
    public function storeDiscussion(Request $request, Course $course): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'lesson_id' => 'nullable|exists:lessons,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        Discussion::create([
            'course_id' => $course->id,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'Discussion topic started.');
    }

    /**
     * Post a reply to a discussion thread.
     */
    public function storeDiscussionPost(Request $request, Discussion $discussion): RedirectResponse
    {
        $user = Auth::user();

        if ($discussion->is_locked) {
            abort(403, 'This discussion thread is locked.');
        }

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:discussion_posts,id',
            'body' => 'required|string',
        ]);

        DiscussionPost::create([
            'discussion_id' => $discussion->id,
            'user_id' => $user->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'Reply posted successfully.');
    }
}
