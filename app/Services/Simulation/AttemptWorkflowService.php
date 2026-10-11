<?php

namespace App\Services\Simulation;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use App\Services\Assessment\CurriculumRubricScoringService;
use App\Services\Audit\AuditService;
use Illuminate\Validation\ValidationException;

class AttemptWorkflowService
{
    public function __construct(
        protected CurriculumRubricScoringService $scoringService
    ) {}

    /**
     * Check if a user meets the prerequisites to access a given laboratory.
     */
    public function checkPrerequisites(User $user, Laboratory $laboratory): bool
    {
        // Instructors and admins can always access all labs
        if ($user->isAdmin() || $user->isInstructor()) {
            return true;
        }

        // Lab 1 has no prerequisites
        if ($laboratory->id === 1 || $laboratory->slug === 'cybersecurity-lab-orientation-and-rules') {
            return true;
        }

        // For Labs 2 through 15: Laboratory 1 must be PASSED with at least 80%
        $lab1 = Laboratory::where('id', 1)
            ->orWhere('slug', 'cybersecurity-lab-orientation-and-rules')
            ->first();

        if (! $lab1) {
            return true;
        }

        $passedLab1Attempt = Attempt::where('user_id', $user->id)
            ->where('laboratory_id', $lab1->id)
            ->where('is_passed', true)
            ->where('final_score', '>=', 80)
            ->exists();

        return $passedLab1Attempt;
    }

    /**
     * Get or create active attempt.
     */
    public function getOrCreateAttempt(User $user, Laboratory $laboratory): Attempt
    {
        return Attempt::firstOrCreate(
            [
                'user_id' => $user->id,
                'laboratory_id' => $laboratory->id,
                'status' => AttemptStatus::IN_PROGRESS,
            ],
            [
                'started_at' => now(),
                'policy_version' => $laboratory->version ?? '1.0.0',
            ]
        );
    }

    /**
     * Autosave trainee progress without submitting.
     */
    public function autosave(Attempt $attempt, array $state): Attempt
    {
        $attempt->update([
            'autosaved_state' => $state,
        ]);

        return $attempt;
    }

    /**
     * Record digital safety policy acknowledgement.
     */
    public function acknowledgeSafety(Attempt $attempt, string $policyVersion = '1.0.0'): Attempt
    {
        $attempt->update([
            'safety_acknowledged_at' => now(),
            'policy_version' => $policyVersion,
        ]);

        AuditService::record('safety_policy_acknowledged', 'Attempt', $attempt->id, [
            'user_id' => $attempt->user_id,
            'policy_version' => $policyVersion,
        ]);

        return $attempt;
    }

    /**
     * Reset virtual scenario state without deleting history.
     */
    public function resetAttempt(Attempt $attempt): Attempt
    {
        $attempt->update([
            'autosaved_state' => null,
            'readiness_answers' => null,
            'evidence_data' => null,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        AuditService::record('attempt_reset', 'Attempt', $attempt->id, [
            'user_id' => $attempt->user_id,
            'laboratory_id' => $attempt->laboratory_id,
        ]);

        return $attempt;
    }

    /**
     * Submit lab attempt and grade with 100-point rubric.
     */
    public function submitAttempt(Attempt $attempt, array $submissionData): Attempt
    {
        // Decode JSON-encoded fields that may arrive from multipart/form-data
        foreach ($submissionData as $key => $value) {
            if (is_string($value) && in_array(substr(trim($value), 0, 1), ['{', '['])) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $submissionData[$key] = $decoded;
                }
            }
        }

        $evaluation = $this->scoringService->evaluateLabAttempt($attempt, $submissionData);

        $attempt->update([
            'status' => $evaluation['is_passed'] ? AttemptStatus::PASSED : AttemptStatus::FAILED,
            'raw_score' => $evaluation['total_score'],
            'final_score' => $evaluation['total_score'],
            'is_passed' => $evaluation['is_passed'],
            'rubric_scores' => $evaluation['scores'],
            'evidence_data' => $submissionData['evidence_record'] ?? null,
            'readiness_answers' => $submissionData['readiness_answers'] ?? null,
            'safety_acknowledged_at' => $attempt->safety_acknowledged_at ?? (! empty($submissionData['safety_acknowledged']) ? now() : null),
            'submitted_at' => now(),
            'instructor_notes' => json_encode($evaluation['feedback']),
        ]);

        AuditService::record('attempt_submitted_rubric', 'Attempt', $attempt->id, [
            'final_score' => $evaluation['total_score'],
            'is_passed' => $evaluation['is_passed'],
            'scores' => $evaluation['scores'],
        ]);

        return $attempt->fresh();
    }
}
