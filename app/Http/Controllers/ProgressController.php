<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\ProgressRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    /**
     * Mark a lesson as completed or update study time.
     */
    public function updateLessonProgress(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:in_progress,completed',
            'time_spent_seconds' => 'nullable|integer|min:0',
        ]);

        $user = Auth::user();
        $module = $lesson->module;
        $course = $module->course;

        $record = ProgressRecord::firstOrNew([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);

        $record->course_id = $course->id;
        $record->module_id = $module->id;
        $record->status = $validated['status'];
        
        if (isset($validated['time_spent_seconds'])) {
            $record->time_spent_seconds += $validated['time_spent_seconds'];
        }

        if ($validated['status'] === 'completed') {
            $record->progress_percentage = 100;
            $record->completed_at = now();
        } else {
            $record->progress_percentage = min(90, max(10, $record->progress_percentage));
        }

        $record->save();

        // Calculate total course completion percentage for the trainee
        $totalLessons = Lesson::whereHas('module', function ($q) use ($course) {
            $q->where('course_id', $course->id);
        })->count();

        $completedLessons = ProgressRecord::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'completed')
            ->count();

        $courseProgress = $totalLessons > 0 ? (int) round(($completedLessons / $totalLessons) * 100) : 0;

        return response()->json([
            'message' => 'Progress updated successfully',
            'record' => $record,
            'course_progress_percentage' => $courseProgress,
            'completed_lessons' => $completedLessons,
            'total_lessons' => $totalLessons,
        ]);
    }
}
