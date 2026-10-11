<?php

namespace App\Services\Assessment;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\Badge;
use App\Models\Certificate;
use App\Services\Audit\AuditService;
use Illuminate\Support\Str;

class ScoringEngineService
{
    /**
     * Score a completed lab attempt.
     */
    public function evaluateAttempt(Attempt $attempt, array $answers): Attempt
    {
        $lab = $attempt->laboratory()->with('questions')->first();
        $questions = $lab->questions->keyBy('id');

        $totalPossiblePoints = $questions->sum('points');
        $earnedPoints = 0;

        foreach ($answers as $questionId => $response) {
            $question = $questions->get($questionId);
            if (! $question) {
                continue;
            }

            $isCorrect = false;
            $awardedPoints = 0;
            $feedback = '';

            $opts = $question->options ?? [];

            if ($question->type === 'multiple_choice' || $question->type === 'true_false') {
                $selectedOptionId = $response['selected_option'] ?? null;
                foreach ($opts as $opt) {
                    if ($opt['id'] === $selectedOptionId && ! empty($opt['is_correct'])) {
                        $isCorrect = true;
                        $awardedPoints = $question->points;
                        $feedback = 'Correct! ' . ($opt['explanation'] ?? '');
                        break;
                    }
                }
                if (! $isCorrect) {
                    $feedback = 'Incorrect. ' . ($question->correct_answer_explanation ?? '');
                }
            } elseif ($question->type === 'short_answer') {
                $userText = trim(strtolower($response['text'] ?? ''));
                foreach ($opts as $opt) {
                    if (trim(strtolower($opt['text'] ?? '')) === $userText) {
                        $isCorrect = true;
                        $awardedPoints = $question->points;
                        $feedback = 'Correct answer!';
                        break;
                    }
                }
                if (! $isCorrect) {
                    $feedback = 'Incorrect. ' . ($question->correct_answer_explanation ?? '');
                }
            } else {
                // Evidence / triage evaluation
                $isCorrect = ! empty($response['is_valid']);
                $awardedPoints = $isCorrect ? $question->points : 0;
            }

            AttemptAnswer::updateOrCreate(
                [
                    'attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                ],
                [
                    'selected_options' => $response['selected_options'] ?? ($response['selected_option'] ? [$response['selected_option']] : null),
                    'text_response' => $response['text'] ?? null,
                    'awarded_points' => $awardedPoints,
                    'is_correct' => $isCorrect,
                    'feedback' => $feedback,
                ]
            );

            $earnedPoints += $awardedPoints;
        }

        $percentage = $totalPossiblePoints > 0 ? (int) round(($earnedPoints / $totalPossiblePoints) * 100) : 0;
        $isPassed = $percentage >= $lab->passing_score;

        $attempt->update([
            'status' => $isPassed ? AttemptStatus::PASSED : AttemptStatus::FAILED,
            'raw_score' => $earnedPoints,
            'penalties' => 0,
            'final_score' => $percentage,
            'is_passed' => $isPassed,
            'submitted_at' => now(),
        ]);

        AuditService::record('attempt_submitted', 'Attempt', $attempt->id, [
            'laboratory_id' => $lab->id,
            'final_score' => $percentage,
            'is_passed' => $isPassed,
        ]);

        // Award badge if passed
        if ($isPassed) {
            $this->checkAndAwardBadges($attempt);
        }

        return $attempt->fresh(['answers', 'laboratory']);
    }

    protected function checkAndAwardBadges(Attempt $attempt): void
    {
        $user = $attempt->user;
        $passedAttemptsCount = Attempt::where('user_id', $user->id)
            ->where('is_passed', true)
            ->count();

        if ($passedAttemptsCount >= 1) {
            $firstBadge = Badge::firstOrCreate(
                ['slug' => 'first-lab-completed'],
                ['name' => 'First Breach Contained', 'description' => 'Successfully passed your first cybersecurity simulation lab.', 'icon' => 'shield-check']
            );
            $user->badges()->syncWithoutDetaching([$firstBadge->id]);
        }

        if ($passedAttemptsCount >= 5) {
            $socBadge = Badge::firstOrCreate(
                ['slug' => 'apprentice-analyst'],
                ['name' => 'Apprentice SOC Analyst', 'description' => 'Completed 5 cybersecurity laboratories with passing marks.', 'icon' => 'award']
            );
            $user->badges()->syncWithoutDetaching([$socBadge->id]);
        }

        if ($passedAttemptsCount >= 15) {
            $cyberBadge = Badge::firstOrCreate(
                ['slug' => 'cyber-defender'],
                ['name' => 'Certified Cyber Defender', 'description' => 'Mastered all 15 curriculum cybersecurity laboratory simulations.', 'icon' => 'medal']
            );
            $user->badges()->syncWithoutDetaching([$cyberBadge->id]);

            // Issue Course Completion Certificate
            if ($attempt->laboratory->course_id) {
                Certificate::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'course_id' => $attempt->laboratory->course_id,
                    ],
                    [
                        'certificate_number' => 'GREG-CYBER-' . strtoupper(Str::random(8)),
                        'verification_token' => Str::uuid()->toString(),
                        'score' => 95,
                        'issued_date' => now()->toDateString(),
                    ]
                );
            }
        }
    }
}
