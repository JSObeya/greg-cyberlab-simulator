<?php

namespace Tests\Feature;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchBLaboratoriesWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_laboratory_2_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab2 = Laboratory::where('slug', 'lab-02-identifying-assets-threats-risks')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab2->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'card_classifications' => [
                'card_student_db' => 'asset',
                'card_sql_injection' => 'vulnerability',
                'card_credential_stuffing' => 'threat',
                'card_daily_backup' => 'control',
                'card_mfa_token' => 'control',
            ],
            'risk_calculations' => [
                'db_exposure' => 25,
                'wifi_default' => 16,
            ],
            'ratings_justification' => 'Direct Internet access to database creates maximum likelihood (5) and confidentiality impact (5) yielding a Critical risk score of 25.',
            'controls_selection' => [
                'preventive' => 'Network segmentation and input validation',
                'detective' => 'Automated database query audit logging',
                'corrective' => 'Daily encrypted offsite database backups',
            ],
            'treatment_statement' => 'Move database behind internal firewall and strictly enforce parameterized queries.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(25, $attempt->rubric_scores['correct_classification']);
        $this->assertEquals(20, $attempt->rubric_scores['risk_calculations']);
        $this->assertEquals(20, $attempt->rubric_scores['evidence_based_ratings']);
        $this->assertEquals(25, $attempt->rubric_scores['control_selection']);
        $this->assertEquals(10, $attempt->rubric_scores['treatment_statement']);
    }

    public function test_laboratory_3_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab3 = Laboratory::where('slug', 'lab-03-strong-passwords-mfa')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab3->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'password_ranking' => [
                'weakest' => 'password123',
                'strongest' => 'correct-horse-battery-staple',
            ],
            'reuse_explanation' => 'Credential reuse allows an attacker who breaches one low-value forum to compromise enterprise accounts via automated credential stuffing.',
            'factor_classification' => [
                'password' => 'knowledge',
                'sms_otp' => 'possession',
                'hardware_key' => 'possession',
                'biometric' => 'inherence',
            ],
            'mfa_recommendations' => [
                'admin' => 'FIDO2 WebAuthn Hardware Security Key',
                'instructor' => 'TOTP Mobile Authenticator App',
                'trainee' => 'TOTP Mobile App or SMS fallback',
            ],
            'identity_checklist' => ['Enforce 16+ chars', 'Disable SMS for privileged tiers', 'Require hardware keys for root'],
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(25, $attempt->rubric_scores['password_evaluation']);
        $this->assertEquals(15, $attempt->rubric_scores['reuse_explanation']);
        $this->assertEquals(20, $attempt->rubric_scores['factor_classification']);
        $this->assertEquals(25, $attempt->rubric_scores['mfa_recommendations']);
        $this->assertEquals(15, $attempt->rubric_scores['checklist']);
    }

    public function test_laboratory_4_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab4 = Laboratory::where('slug', 'lab-04-recognising-phishing-emails')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab4->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'indicators' => ['typosquatting', 'urgent deadline', 'suspicious link', 'spf softfail', 'free webmail reply-to'],
            'header_interpretation' => [
                'spf_mismatch' => 'SPF returned SoftFail for sending IP',
                'reply_to_discrepancy' => 'Reply-To points to external gmail account',
            ],
            'email_classifications' => [
                'mail_01' => 'phishing',
                'mail_02' => 'legitimate',
                'mail_03' => 'phishing',
                'mail_04' => 'suspicious',
                'mail_05' => 'legitimate',
                'mail_06' => 'phishing',
            ],
            'safe_actions' => [
                'do_not_click' => 'Do not click links or open attachments',
                'report_channel' => 'Report to SOC via phishing response button',
                'containment_step' => 'Block sending IP and purge inbox instances',
            ],
            'reasoning' => 'The sender address impersonates internal finance with typo greg-acaddemy.ng and external reply-to.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertGreaterThanOrEqual(95, $attempt->final_score);
    }

    public function test_laboratory_5_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab5 = Laboratory::where('slug', 'lab-05-safe-browsing-suspicious-urls')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab5->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'url_parsing' => [
                'scheme' => 'https',
                'hostname' => 'portal.bank.com.security-verify.test',
                'registered_domain' => 'security-verify.test',
                'path' => '/login',
                'query' => 'redirect=auth',
            ],
            'deception_indicators' => [
                'deceptive_subdomain' => 'portal.bank.com is a deceptive subdomain prefix',
                'typosquatting' => 'Mimics trusted financial institution',
                'unusual_port' => 'Uses RFC 2606 reserved test TLD',
            ],
            'https_explanation' => 'HTTPS only encrypts transmission in transit; it does not verify whether the destination site owner is legitimate or an adversary.',
            'url_classifications' => [
                'url_1' => 'deceptive',
                'url_2' => 'safe',
                'url_3' => 'suspicious',
                'url_4' => 'deceptive',
                'url_5' => 'safe',
            ],
            'safe_action' => 'Submit to security team for gateway blocklist.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
    }

    public function test_laboratory_6_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab6 = Laboratory::where('slug', 'lab-06-file-hashes-integrity-verification')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab6->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'commands_used' => ['sha256sum', 'ls', 'file'],
            'digest_comparison' => [
                'mismatched_file' => 'updater.bin',
                'matched_files_count' => 2,
            ],
            'interpretation' => 'The computed digest differs completely from official SHA256SUMS manifest, confirming unauthorized tampering.',
            'chain_of_custody' => [
                'file_name' => 'updater.bin',
                'computed_hash' => '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
                'handler' => 'analyst',
                'timestamp' => '2026-10-11 10:15 UTC',
            ],
            'recommended_action' => 'Quarantine binary immediately, issue security bulletin, and trace mirror source.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
    }
}
