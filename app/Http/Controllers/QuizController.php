<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    /**
     * Start a quiz attempt or resume active one.
     */
    public function startAttempt(Request $request, Quiz $quiz): JsonResponse
    {
        $user = Auth::user();

        // Check if an attempt is already in progress
        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if (! $attempt) {
            $previousAttemptsCount = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->count();

            if ($quiz->max_attempts > 0 && $previousAttemptsCount >= $quiz->max_attempts) {
                return response()->json([
                    'error' => 'Maximum attempts reached for this quiz.',
                ], 422);
            }

            $attempt = QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'attempt_number' => $previousAttemptsCount + 1,
                'status' => 'in_progress',
                'started_at' => now(),
                'expires_at' => $quiz->time_limit_minutes > 0 ? now()->addMinutes($quiz->time_limit_minutes) : null,
                'answers_state' => [],
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'quiz_attempt_started',
                'entity_type' => QuizAttempt::class,
                'entity_id' => $attempt->id,
                'payload' => ['quiz_id' => $quiz->id, 'attempt_number' => $attempt->attempt_number],
            ]);
        }

        // Return questions without the correct answers revealed
        $questions = $quiz->questions()->get()->map(function ($q) {
            $cleanOptions = collect($q->options ?? [])->map(function ($opt) {
                return [
                    'id' => $opt['id'] ?? null,
                    'text' => $opt['text'] ?? '',
                ];
            });

            return [
                'id' => $q->id,
                'prompt' => $q->prompt,
                'type' => $q->type,
                'points' => $q->points,
                'options' => $cleanOptions,
            ];
        });

        return response()->json([
            'attempt' => $attempt,
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'time_limit_minutes' => $quiz->time_limit_minutes,
                'passing_score_percentage' => $quiz->passing_score_percentage,
            ],
            'questions' => $questions,
        ]);
    }

    /**
     * Autosave trainee answers in real-time.
     */
    public function autosave(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $user = Auth::user();
        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['error' => 'Attempt already finalized.'], 422);
        }

        // Check if expired
        if ($attempt->expires_at && now()->isAfter($attempt->expires_at)) {
            $this->finalizeAttempt($attempt);
            return response()->json(['error' => 'Time expired.'], 422);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $attempt->update([
            'answers_state' => $validated['answers'],
        ]);

        return response()->json(['message' => 'Autosaved successfully.']);
    }

    /**
     * Submit and auto-grade the quiz attempt.
     */
    public function submitAttempt(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $user = Auth::user();
        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['error' => 'Attempt already finalized.'], 422);
        }

        if ($request->has('answers')) {
            $attempt->update(['answers_state' => $request->input('answers')]);
        }

        $result = $this->finalizeAttempt($attempt);

        return response()->json($result);
    }

    /**
     * Grade attempt and calculate score.
     */
    protected function finalizeAttempt(QuizAttempt $attempt): array
    {
        $quiz = $attempt->quiz;
        $questions = $quiz->questions;
        $answers = $attempt->answers_state ?? [];

        $totalPointsPossible = 0;
        $awardedPoints = 0;

        foreach ($questions as $question) {
            $totalPointsPossible += $question->points;
            $userAnswer = $answers[$question->id] ?? null;

            if ($userAnswer !== null) {
                // Find correct option ID from original question options
                $correctOpt = collect($question->options)->firstWhere('is_correct', true);
                if ($correctOpt && isset($correctOpt['id']) && $correctOpt['id'] == $userAnswer) {
                    $awardedPoints += $question->points;
                }
            }
        }

        $percentage = $totalPointsPossible > 0 ? (int) round(($awardedPoints / $totalPointsPossible) * 100) : 0;
        $isPassed = $percentage >= $quiz->passing_score_percentage;

        $attempt->update([
            'status' => 'graded',
            'submitted_at' => now(),
            'total_score' => $awardedPoints,
            'score_percentage' => $percentage,
            'is_passed' => $isPassed,
        ]);

        AuditLog::create([
            'user_id' => $attempt->user_id,
            'action' => 'quiz_attempt_submitted',
            'entity_type' => QuizAttempt::class,
            'entity_id' => $attempt->id,
            'payload' => [
                'score' => $awardedPoints,
                'percentage' => $percentage,
                'is_passed' => $isPassed,
            ],
        ]);

        return [
            'message' => 'Quiz graded successfully.',
            'total_score' => $awardedPoints,
            'total_points_possible' => $totalPointsPossible,
            'score_percentage' => $percentage,
            'is_passed' => $isPassed,
        ];
    }
}
