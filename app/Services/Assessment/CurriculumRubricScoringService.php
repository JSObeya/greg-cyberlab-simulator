<?php

namespace App\Services\Assessment;

use App\Models\Attempt;
use App\Models\Laboratory;

class CurriculumRubricScoringService
{
    /**
     * Evaluate an attempt according to the curriculum 100-point rubric.
     */
    public function evaluateLabAttempt(Attempt $attempt, array $submissionData): array
    {
        $lab = $attempt->laboratory;

        // Custom evaluator for Lab 1 (Orientation and Rules)
        if ($lab->slug === 'cybersecurity-lab-orientation-and-rules' || $lab->id === 1) {
            return $this->evaluateLaboratory1($attempt, $submissionData);
        }

        // Generic fallback for other labs
        return $this->evaluateGenericRubric($attempt, $submissionData);
    }

    /**
     * Laboratory 1 100-point Rubric Evaluator
     *
     * Rubric:
     * - Scope identification: 20 points
     * - Activity classification: 30 points (5 cards x 6 pts)
     * - CIA matching: 20 points (3 incidents x 6.67 pts rounded)
     * - Evidence record: 20 points
     * - Safety acknowledgement: 10 points
     * Total: 100 points. Pass mark: 80 points.
     */
    protected function evaluateLaboratory1(Attempt $attempt, array $data): array
    {
        $scores = [];
        $feedback = [];

        // 1. Scope Identification (20 points)
        $scopePoints = 0;
        $scopeAnswers = $data['scope_answers'] ?? [];
        if (trim($scopeAnswers['subnet'] ?? '') === '192.168.50.0/24') {
            $scopePoints += 8;
        }
        if (! empty($scopeAnswers['window_identified'])) {
            $scopePoints += 6;
        }
        if (! empty($scopeAnswers['external_out_of_scope'])) {
            $scopePoints += 6;
        }
        $scores['scope_identification'] = min(20, $scopePoints);
        $feedback['scope_identification'] = $scores['scope_identification'] === 20
            ? 'Full marks: Engagement scope, authorized subnet (192.168.50.0/24), and out-of-scope boundaries correctly identified.'
            : 'Partial marks: Review the engagement brief to ensure exact subnet and boundary rules are recognized.';

        // 2. Activity Classification (30 points: 5 cards x 6 points)
        $cardKey = [
            'card_port_scan_in_scope' => 'permitted',
            'card_bruteforce_hostinger_cpanel' => 'prohibited',
            'card_external_link_probe' => 'prohibited',
            'card_unlisted_vuln_script' => 'ask_instructor',
            'card_capture_http_headers' => 'permitted',
        ];
        $classificationPoints = 0;
        $userCards = $data['activity_classifications'] ?? [];
        foreach ($cardKey as $cardId => $expectedCategory) {
            if (isset($userCards[$cardId]) && $userCards[$cardId] === $expectedCategory) {
                $classificationPoints += 6;
            }
        }
        $scores['activity_classification'] = $classificationPoints;
        $feedback['activity_classification'] = "Scored {$classificationPoints}/30 points across all 5 engagement activity cards.";

        // 3. CIA Matching (20 points: 3 incidents -> 7 + 7 + 6)
        $ciaKey = [
            'incident_unauth_data_leak' => 'confidentiality',
            'incident_grade_tampering' => 'integrity',
            'incident_auth_portal_dos' => 'availability',
        ];
        $ciaPoints = 0;
        $userCia = $data['cia_matches'] ?? [];
        if (($userCia['incident_unauth_data_leak'] ?? '') === 'confidentiality') {
            $ciaPoints += 7;
        }
        if (($userCia['incident_grade_tampering'] ?? '') === 'integrity') {
            $ciaPoints += 7;
        }
        if (($userCia['incident_auth_portal_dos'] ?? '') === 'availability') {
            $ciaPoints += 6;
        }
        $scores['cia_matching'] = $ciaPoints;
        $feedback['cia_matching'] = "Scored {$ciaPoints}/20 points on CIA Triad incident objective alignment.";

        // 4. Evidence Record (20 points)
        $evidence = $data['evidence_record'] ?? [];
        $evidencePoints = 0;
        if (! empty($evidence['observation']) && strlen(trim($evidence['observation'])) >= 10) {
            $evidencePoints += 7;
        }
        if (! empty($evidence['conclusion']) && strlen(trim($evidence['conclusion'])) >= 10) {
            $evidencePoints += 7;
        }
        $hasTimestamp = ! empty($evidence['timestamp']) || ! empty($evidence['time']);
        if ($hasTimestamp && ! empty($evidence['source']) && ! empty($evidence['action'])) {
            $evidencePoints += 6;
        }
        $scores['evidence_record'] = min(20, $evidencePoints);
        $feedback['evidence_record'] = $scores['evidence_record'] === 20
            ? 'Complete evidence record properly distinguishing empirical observation from analytical conclusion.'
            : 'Evidence record is incomplete. Ensure observation, conclusion, source, and action are articulated.';

        // 5. Safety Acknowledgement (10 points)
        $acknowledged = ! empty($data['safety_acknowledged']) || ! empty($attempt->safety_acknowledged_at);
        $scores['safety_acknowledgement'] = $acknowledged ? 10 : 0;
        $feedback['safety_acknowledgement'] = $acknowledged
            ? 'Digitally signed and accepted ethical rules of engagement.'
            : 'Zero points: The mandatory safety acknowledgement was not confirmed.';

        $totalScore = array_sum($scores);
        $isPassed = $totalScore >= 80;

        return [
            'scores' => $scores,
            'total_score' => $totalScore,
            'is_passed' => $isPassed,
            'feedback' => $feedback,
            'passing_score' => 80,
        ];
    }

    /**
     * Generic Rubric Evaluator for subsequent labs.
     */
    protected function evaluateGenericRubric(Attempt $attempt, array $data): array
    {
        $lab = $attempt->laboratory;
        $rubric = $lab->rubric ?? [];
        $scores = [];
        $feedback = [];
        $total = 0;

        foreach ($rubric as $item) {
            $key = $item['key'] ?? 'criterion';
            $maxMarks = $item['max_marks'] ?? 20;
            $submittedVal = $data[$key] ?? null;

            // Deterministic calculation if matching key exists
            $awarded = 0;
            if (is_numeric($submittedVal)) {
                $awarded = min($maxMarks, (int) $submittedVal);
            } elseif (! empty($submittedVal)) {
                $awarded = $maxMarks;
            }
            $scores[$key] = $awarded;
            $total += $awarded;
        }

        $isPassed = $total >= ($lab->passing_score ?? 70);

        return [
            'scores' => $scores,
            'total_score' => $total,
            'is_passed' => $isPassed,
            'feedback' => $feedback,
            'passing_score' => $lab->passing_score ?? 70,
        ];
    }
}
