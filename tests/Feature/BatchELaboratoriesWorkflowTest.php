<?php

namespace Tests\Feature;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchELaboratoriesWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_laboratory_14_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab14 = Laboratory::where('slug', 'lab-14-vulnerability-scoring-prioritization')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab14->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'finding_validation' => [
                'vsftpd_backdoor_verified' => true,
                'apache_traversal_verified' => true,
            ],
            'contextual_prioritisation' => [
                'critical_host_ranked_highest' => true,
                'exposure_context_factored' => true,
            ],
            'treatment_plan' => [
                'patch_vsftpd_remediation' => true,
                'upgrade_apache_remediation' => true,
                'compensating_control' => true,
            ],
            'verification_steps' => 'Perform credentialed OpenVAS rescan and confirm vsftpd 2.3.4 package removal.',
            'management_summary' => 'Critical perimeter vulnerabilities remediated within 24hr SLA with zero production downtime.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(20, $attempt->rubric_scores['finding_validation']);
        $this->assertEquals(30, $attempt->rubric_scores['contextual_prioritisation']);
        $this->assertEquals(25, $attempt->rubric_scores['treatment_plan']);
        $this->assertEquals(15, $attempt->rubric_scores['verification_steps']);
        $this->assertEquals(10, $attempt->rubric_scores['management_summary']);
    }

    public function test_laboratory_15_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab15 = Laboratory::where('slug', 'lab-15-soc-alert-triage-incident-response')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab15->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'alert_triage' => [
                'critical_alert_isolated' => true,
                'false_positive_eliminated' => true,
            ],
            'scope_and_severity' => [
                'compromised_host_identified' => true,
                'severity_rating_assigned' => true,
            ],
            'incident_timeline' => [
                '09:12:00 - Phishing payload executed via invoice.docx macro',
                '09:14:22 - Beaconing detected to C2 198.51.100.44',
                '09:18:05 - Procdump executed against lsass.exe',
            ],
            'containment_actions' => [
                'host_network_isolated' => true,
                'compromised_account_disabled' => true,
                'firewall_block_attacker_ip' => true,
            ],
            'evidence_preservation' => 'Preserved physical RAM dump image and exported event logs with SHA-256 hash.',
            'recovery_plan' => 'Re-image host from known baseline and reset corp\\bursar credentials.',
            'incident_report' => 'End-to-end incident successfully contained within 30 minutes following NIST SP 800-61r2.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(15, $attempt->rubric_scores['alert_triage']);
        $this->assertEquals(15, $attempt->rubric_scores['scope_and_severity']);
        $this->assertEquals(20, $attempt->rubric_scores['timeline']);
        $this->assertEquals(15, $attempt->rubric_scores['containment']);
        $this->assertEquals(10, $attempt->rubric_scores['evidence_handling']);
        $this->assertEquals(10, $attempt->rubric_scores['recovery_plan']);
        $this->assertEquals(15, $attempt->rubric_scores['incident_report']);
    }

    public function test_all_15_laboratories_are_registered_and_have_prerequisites(): void
    {
        $labs = Laboratory::orderBy('id')->get();
        $this->assertCount(15, $labs);

        $expectedSlugs = [
            'lab-01-orientation-rules',
            'lab-02-identifying-assets-threats-risks',
            'lab-03-strong-passwords-mfa',
            'lab-04-recognising-phishing-emails',
            'lab-05-safe-browsing-suspicious-urls',
            'lab-06-file-hashes-integrity-verification',
            'lab-07-basic-linux-commands-kali-terminal',
            'lab-08-ip-addressing-ports-protocols',
            'lab-09-simulated-host-discovery-service-id',
            'lab-10-firewall-rule-analysis-exposure',
            'lab-11-security-log-analysis',
            'lab-12-packet-capture-interpretation',
            'lab-13-web-request-http-header-inspection',
            'lab-14-vulnerability-scoring-prioritization',
            'lab-15-soc-alert-triage-incident-response',
        ];

        $actualSlugs = $labs->pluck('slug')->toArray();
        $this->assertEquals($expectedSlugs, $actualSlugs);
    }
}
