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

        // Custom evaluators per curriculum specifications
        if ($lab->slug === 'lab-01-orientation-rules' || $lab->id === 1) {
            return $this->evaluateLaboratory1($attempt, $submissionData);
        }

        if ($lab->slug === 'lab-02-identifying-assets-threats-risks' || $lab->id === 2) {
            return $this->evaluateLaboratory2($attempt, $submissionData);
        }

        if ($lab->slug === 'lab-03-strong-passwords-mfa' || $lab->id === 3) {
            return $this->evaluateLaboratory3($attempt, $submissionData);
        }

        if ($lab->slug === 'lab-04-recognising-phishing-emails' || $lab->id === 4) {
            return $this->evaluateLaboratory4($attempt, $submissionData);
        }

        if ($lab->slug === 'lab-05-safe-browsing-suspicious-urls' || $lab->id === 5) {
            return $this->evaluateLaboratory5($attempt, $submissionData);
        }

        if ($lab->slug === 'lab-06-file-hashes-integrity-verification' || $lab->id === 6) {
            return $this->evaluateLaboratory6($attempt, $submissionData);
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
     * Laboratory 2 100-point Rubric: Assets, Threats, Vulnerabilities & Risk (Pass: 70%)
     * Rubric: Correct classification (25), Risk calculations (20), Evidence-based ratings (20), Control selection (25), Treatment statement (10)
     */
    protected function evaluateLaboratory2(Attempt $attempt, array $data): array
    {
        $scores = [];
        $feedback = [];

        // 1. Correct Classification (25 pts: 5 cards x 5 pts)
        $expected = [
            'card_student_db' => 'asset',
            'card_sql_injection' => 'vulnerability',
            'card_credential_stuffing' => 'threat',
            'card_daily_backup' => 'control',
            'card_mfa_token' => 'control',
        ];
        $classScore = 0;
        $classAnswers = $data['card_classifications'] ?? [];
        foreach ($expected as $cId => $type) {
            if (($classAnswers[$cId] ?? '') === $type) {
                $classScore += 5;
            }
        }
        $scores['correct_classification'] = $classScore;
        $feedback['correct_classification'] = "Classification: {$classScore}/25 marks awarded.";

        // 2. Risk Calculations (20 pts)
        // Score = Likelihood x Impact (1-5 scale)
        $calcScore = 0;
        $calcAnswers = $data['risk_calculations'] ?? [];
        if (! empty($calcAnswers['db_exposure']) && (int)$calcAnswers['db_exposure'] === 25) {
            $calcScore += 10;
        }
        if (! empty($calcAnswers['wifi_default']) && in_array((int)$calcAnswers['wifi_default'], [12, 15, 16])) {
            $calcScore += 10;
        }
        $scores['risk_calculations'] = $calcScore;
        $feedback['risk_calculations'] = "Risk formula calculation: {$calcScore}/20 marks.";

        // 3. Evidence-based Ratings (20 pts)
        $ratingReason = $data['ratings_justification'] ?? '';
        $scores['evidence_based_ratings'] = strlen(trim($ratingReason)) >= 20 ? 20 : 10;
        $feedback['evidence_based_ratings'] = "Ratings justification: {$scores['evidence_based_ratings']}/20 marks.";

        // 4. Control Selection (25 pts)
        // Preventative, Detective, Corrective for highest risk
        $controls = $data['controls_selection'] ?? [];
        $ctrlScore = 0;
        if (! empty($controls['preventive'])) $ctrlScore += 9;
        if (! empty($controls['detective'])) $ctrlScore += 8;
        if (! empty($controls['corrective'])) $ctrlScore += 8;
        $scores['control_selection'] = $ctrlScore;
        $feedback['control_selection'] = "Controls: {$ctrlScore}/25 marks (Preventive, Detective, Corrective).";

        // 5. Treatment Statement (10 pts)
        $statement = $data['treatment_statement'] ?? '';
        $scores['treatment_statement'] = strlen(trim($statement)) >= 15 ? 10 : 5;

        $total = array_sum($scores);
        return [
            'scores' => $scores,
            'total_score' => $total,
            'is_passed' => $total >= 70,
            'feedback' => $feedback,
            'passing_score' => 70,
        ];
    }

    /**
     * Laboratory 3 100-point Rubric: Strong Passwords and MFA (Pass: 70%)
     * Rubric: Password evaluation (25), Reuse explanation (15), Factor classification (20), MFA recommendations (25), Checklist (15)
     */
    protected function evaluateLaboratory3(Attempt $attempt, array $data): array
    {
        $scores = [];
        $feedback = [];

        // 1. Password Evaluation (25 pts)
        $evalScore = 0;
        $ranked = $data['password_ranking'] ?? [];
        if (($ranked['weakest'] ?? '') === 'password123') $evalScore += 10;
        if (($ranked['strongest'] ?? '') === 'correct-horse-battery-staple') $evalScore += 15;
        $scores['password_evaluation'] = $evalScore;

        // 2. Reuse Explanation (15 pts)
        $reuse = $data['reuse_explanation'] ?? '';
        $scores['reuse_explanation'] = strlen(trim($reuse)) >= 15 ? 15 : 7;

        // 3. Factor Classification (20 pts)
        $factorMatches = $data['factor_classification'] ?? [];
        $fScore = 0;
        if (($factorMatches['password'] ?? '') === 'knowledge') $fScore += 5;
        if (($factorMatches['sms_otp'] ?? '') === 'possession') $fScore += 5;
        if (($factorMatches['hardware_key'] ?? '') === 'possession') $fScore += 5;
        if (($factorMatches['biometric'] ?? '') === 'inherence') $fScore += 5;
        $scores['factor_classification'] = $fScore;

        // 4. MFA Recommendations (25 pts)
        $mfaRecs = $data['mfa_recommendations'] ?? [];
        $mfaScore = 0;
        if (! empty($mfaRecs['admin'])) $mfaScore += 10;
        if (! empty($mfaRecs['instructor'])) $mfaScore += 8;
        if (! empty($mfaRecs['trainee'])) $mfaScore += 7;
        $scores['mfa_recommendations'] = $mfaScore;

        // 5. Checklist (15 pts)
        $checklist = $data['identity_checklist'] ?? [];
        $scores['checklist'] = count($checklist) >= 3 ? 15 : 8;

        $total = array_sum($scores);
        return [
            'scores' => $scores,
            'total_score' => $total,
            'is_passed' => $total >= 70,
            'feedback' => $feedback,
            'passing_score' => 70,
        ];
    }

    /**
     * Laboratory 4 100-point Rubric: Recognising Phishing Emails (Pass: 70%)
     * Rubric: Indicator identification (30), Header interpretation (20), Classification (20), Safe response actions (20), Reasoning quality (10)
     */
    protected function evaluateLaboratory4(Attempt $attempt, array $data): array
    {
        $scores = [];
        $feedback = [];

        // 1. Indicator Identification (30 pts)
        $indicators = $data['indicators'] ?? [];
        $scores['indicator_identification'] = min(30, count($indicators) * 6);

        // 2. Header Interpretation (20 pts)
        $headers = $data['header_interpretation'] ?? [];
        $hScore = 0;
        if (! empty($headers['spf_mismatch'])) $hScore += 10;
        if (! empty($headers['reply_to_discrepancy'])) $hScore += 10;
        $scores['header_interpretation'] = $hScore;

        // 3. Classification (20 pts)
        $classifications = $data['email_classifications'] ?? [];
        $cScore = 0;
        // 6 messages: 2 legitimate, 3 phishing, 1 suspicious
        $expected = [
            'mail_01' => 'phishing',
            'mail_02' => 'legitimate',
            'mail_03' => 'phishing',
            'mail_04' => 'suspicious',
            'mail_05' => 'legitimate',
            'mail_06' => 'phishing',
        ];
        foreach ($expected as $mId => $cat) {
            if (($classifications[$mId] ?? '') === $cat) {
                $cScore += 3.33;
            }
        }
        $scores['classification'] = (int) round($cScore);

        // 4. Safe Response Actions (20 pts)
        $actions = $data['safe_actions'] ?? [];
        $actScore = 0;
        if (! empty($actions['do_not_click'])) $actScore += 7;
        if (! empty($actions['report_channel'])) $actScore += 7;
        if (! empty($actions['containment_step'])) $actScore += 6;
        $scores['safe_response_actions'] = $actScore;

        // 5. Reasoning Quality (10 pts)
        $reason = $data['reasoning'] ?? '';
        $scores['reasoning_quality'] = strlen(trim($reason)) >= 15 ? 10 : 5;

        $total = array_sum($scores);
        return [
            'scores' => $scores,
            'total_score' => $total,
            'is_passed' => $total >= 70,
            'feedback' => $feedback,
            'passing_score' => 70,
        ];
    }

    /**
     * Laboratory 5 100-point Rubric: Safe Browsing & URL Analysis (Pass: 70%)
     * Rubric: URL parsing (25), Deception indicators (30), HTTPS explanation (15), Classification (20), Safe action (10)
     */
    protected function evaluateLaboratory5(Attempt $attempt, array $data): array
    {
        $scores = [];
        $feedback = [];

        // 1. URL Parsing (25 pts)
        $parsing = $data['url_parsing'] ?? [];
        $pScore = 0;
        if (! empty($parsing['scheme'])) $pScore += 5;
        if (! empty($parsing['hostname'])) $pScore += 5;
        if (! empty($parsing['registered_domain'])) $pScore += 5;
        if (! empty($parsing['path'])) $pScore += 5;
        if (! empty($parsing['query'])) $pScore += 5;
        $scores['url_parsing'] = $pScore;

        // 2. Deception Indicators (30 pts)
        $deception = $data['deception_indicators'] ?? [];
        $dScore = 0;
        if (! empty($deception['deceptive_subdomain'])) $dScore += 10;
        if (! empty($deception['typosquatting'])) $dScore += 10;
        if (! empty($deception['unusual_port'])) $dScore += 10;
        $scores['deception_indicators'] = $dScore;

        // 3. HTTPS Explanation (15 pts)
        $httpsExp = $data['https_explanation'] ?? '';
        $scores['https_explanation'] = strlen(trim($httpsExp)) >= 15 ? 15 : 7;

        // 4. Classification (20 pts: 5 URLs x 4 pts)
        $classifications = $data['url_classifications'] ?? [];
        $expected = [
            'url_1' => 'deceptive',
            'url_2' => 'safe',
            'url_3' => 'suspicious',
            'url_4' => 'deceptive',
            'url_5' => 'safe',
        ];
        $cScore = 0;
        foreach ($expected as $uId => $cat) {
            if (($classifications[$uId] ?? '') === $cat) {
                $cScore += 4;
            }
        }
        $scores['classification'] = $cScore;

        // 5. Safe Action (10 pts)
        $safeAct = $data['safe_action'] ?? '';
        $scores['safe_action'] = strlen(trim($safeAct)) >= 10 ? 10 : 5;

        $total = array_sum($scores);
        return [
            'scores' => $scores,
            'total_score' => $total,
            'is_passed' => $total >= 70,
            'feedback' => $feedback,
            'passing_score' => 70,
        ];
    }

    /**
     * Laboratory 6 100-point Rubric: File Hashes & Integrity Verification (Pass: 70%)
     * Rubric: Command selection (20), Digest comparison (30), Interpretation (20), Evidence record (20), Recommended action (10)
     */
    protected function evaluateLaboratory6(Attempt $attempt, array $data): array
    {
        $scores = [];
        $feedback = [];

        // 1. Command Selection (20 pts)
        $commandsUsed = $data['commands_used'] ?? [];
        $cmdScore = 0;
        if (in_array('sha256sum', $commandsUsed) || ! empty($data['ran_sha256sum'])) $cmdScore += 12;
        if (in_array('ls', $commandsUsed) || ! empty($data['ran_ls'])) $cmdScore += 4;
        if (in_array('file', $commandsUsed) || ! empty($data['ran_file'])) $cmdScore += 4;
        $scores['command_selection'] = $cmdScore;

        // 2. Digest Comparison (30 pts)
        $digestAnswers = $data['digest_comparison'] ?? [];
        $dScore = 0;
        if (($digestAnswers['mismatched_file'] ?? '') === 'updater.bin') $dScore += 20;
        if (! empty($digestAnswers['matched_files_count']) && (int)$digestAnswers['matched_files_count'] === 2) $dScore += 10;
        $scores['digest_comparison'] = $dScore;

        // 3. Interpretation (20 pts)
        $interpretation = $data['interpretation'] ?? '';
        $scores['interpretation'] = strlen(trim($interpretation)) >= 15 ? 20 : 10;

        // 4. Evidence Record / Chain of Custody (20 pts)
        $chain = $data['chain_of_custody'] ?? [];
        $cScore = 0;
        if (! empty($chain['file_name']) && ! empty($chain['computed_hash'])) $cScore += 10;
        if (! empty($chain['handler']) && ! empty($chain['timestamp'])) $cScore += 10;
        $scores['evidence_record'] = $cScore;

        // 5. Recommended Action (10 pts)
        $action = $data['recommended_action'] ?? '';
        $scores['recommended_action'] = strlen(trim($action)) >= 10 ? 10 : 5;

        $total = array_sum($scores);
        return [
            'scores' => $scores,
            'total_score' => $total,
            'is_passed' => $total >= 70,
            'feedback' => $feedback,
            'passing_score' => 70,
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
