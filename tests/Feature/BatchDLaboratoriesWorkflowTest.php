<?php

namespace Tests\Feature;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchDLaboratoriesWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_laboratory_11_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab11 = Laboratory::where('slug', 'lab-11-security-log-analysis')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab11->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'log_filtering' => [
                'failed_ssh_count' => 3,
                'filter_syntax_used' => 'grep "Failed password" /var/log/auth.log',
            ],
            'log_correlation' => [
                'attacker_ip' => '192.168.50.120',
                'compromised_user' => 'deploy',
            ],
            'incident_timeline' => [
                '02:14:01 - Failed attempt user admin',
                '02:14:05 - Failed attempt user root',
                '02:14:12 - Failed attempt user deploy',
                '02:14:28 - Accepted password for deploy',
            ],
            'finding_statement' => 'Attacker 192.168.50.120 performed dictionary attack and breached account deploy.',
            'response_recommendations' => [
                'disable_password_auth' => true,
                'rotate_credentials' => true,
                'install_fail2ban' => true,
            ],
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(20, $attempt->rubric_scores['log_filtering']);
        $this->assertEquals(25, $attempt->rubric_scores['correlation']);
        $this->assertEquals(20, $attempt->rubric_scores['timeline_accuracy']);
        $this->assertEquals(20, $attempt->rubric_scores['finding_quality']);
        $this->assertEquals(15, $attempt->rubric_scores['response_recommendations']);
    }

    public function test_laboratory_12_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab12 = Laboratory::where('slug', 'lab-12-packet-capture-interpretation')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab12->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'frame_filtering' => [
                'target_frame_no' => 4,
                'protocol_filtered' => 'HTTP',
            ],
            'handshake_sequence' => [
                'syn_detected' => true,
                'syn_ack_detected' => true,
                'ack_detected' => true,
            ],
            'intercepted_credentials' => [
                'username' => 'admin',
                'password' => 'AdminSecret2026!',
            ],
            'evidence_citation' => 'Frame 4, Time 0.015s, cleartext HTTP POST payload.',
            'remediation_strategy' => 'Mandate TLS 1.3 across all web endpoints; drop unencrypted HTTP port 80 traffic.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(20, $attempt->rubric_scores['filtering']);
        $this->assertEquals(25, $attempt->rubric_scores['protocol_sequence']);
        $this->assertEquals(25, $attempt->rubric_scores['exposure_identification']);
        $this->assertEquals(15, $attempt->rubric_scores['evidence_citation']);
        $this->assertEquals(15, $attempt->rubric_scores['remediation_and_limits']);
    }

    public function test_laboratory_13_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab13 = Laboratory::where('slug', 'lab-13-web-request-http-header-inspection')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab13->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'request_interpretation' => [
                'http_status_code' => 200,
                'server_banner_identified' => 'Apache/2.4.52 (Ubuntu)',
            ],
            'cookie_security_analysis' => [
                'missing_httponly' => true,
                'missing_secure' => true,
                'missing_samesite' => true,
            ],
            'missing_security_headers' => [
                'missing_csp' => true,
                'missing_x_frame_options' => true,
                'missing_hsts' => true,
            ],
            'remediation_priority' => 'Deploy HttpOnly and Secure on cookies, followed by CSP and X-Frame-Options.',
            'verification_test_command' => 'curl -I https://portal.example.test',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(20, $attempt->rubric_scores['request_interpretation']);
        $this->assertEquals(25, $attempt->rubric_scores['cookie_analysis']);
        $this->assertEquals(25, $attempt->rubric_scores['header_analysis']);
        $this->assertEquals(15, $attempt->rubric_scores['prioritisation']);
        $this->assertEquals(15, $attempt->rubric_scores['verification_tests']);
    }
}
