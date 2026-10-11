<?php

namespace Tests\Feature;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchCLaboratoriesWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_laboratory_7_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab7 = Laboratory::where('slug', 'lab-07-basic-linux-commands-kali-terminal')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab7->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'navigation_evidence' => [
                'current_directory' => '/home/analyst/audit_workspace',
                'located_workspace' => true,
            ],
            'file_inspection' => [
                'flag_content' => 'FLAG{KALI_NAV_SUCCESS}',
                'file_type_identified' => 'ASCII text configuration flag',
            ],
            'log_filtering' => [
                'grep_pattern_used' => 'grep failed /var/log/auth.log',
                'failed_login_ip' => '192.168.50.105',
            ],
            'hash_verification' => [
                'computed_hash' => '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
            ],
            'permissions_answer' => '-rw-r--r-- (standard user readable/writable; others read only).',
            'evidence_summary' => 'Located flag in audit_workspace; filtered auth.log to find failed logins from 192.168.50.105.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(20, $attempt->rubric_scores['navigation']);
        $this->assertEquals(20, $attempt->rubric_scores['file_inspection']);
        $this->assertEquals(25, $attempt->rubric_scores['log_filtering']);
        $this->assertEquals(15, $attempt->rubric_scores['hashing']);
        $this->assertEquals(10, $attempt->rubric_scores['permission_interpretation']);
        $this->assertEquals(10, $attempt->rubric_scores['evidence_selection']);
    }

    public function test_laboratory_8_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab8 = Laboratory::where('slug', 'lab-08-ip-addressing-ports-protocols')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab8->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'addressing_analysis' => [
                'workstation_ip' => '10.10.10.15',
                'subnet_mask' => '/24',
                'network_range' => '10.10.10.1 - 10.10.10.254',
            ],
            'protocol_mappings' => [
                '22' => 'ssh',
                '53' => 'dns',
                '80' => 'http',
                '443' => 'https',
            ],
            'command_interpretation' => [
                'ssh_listening_detected' => true,
                'mysql_local_binding_detected' => true,
            ],
            'exposure_decisions' => [
                'external_ssh_policy' => 'Restrict SSH access strictly to management bastion IPs.',
                'mysql_localhost_only' => 'Bind database exclusively to 127.0.0.1.',
            ],
            'technical_explanation' => 'Listening sockets exposed to 0.0.0.0 allow any accessible host to initiate attacks; loopback limits access to local services.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(25, $attempt->rubric_scores['addressing']);
        $this->assertEquals(20, $attempt->rubric_scores['protocol_mapping']);
        $this->assertEquals(20, $attempt->rubric_scores['command_interpretation']);
        $this->assertEquals(25, $attempt->rubric_scores['exposure_decisions']);
        $this->assertEquals(10, $attempt->rubric_scores['explanation']);
    }

    public function test_laboratory_9_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab9 = Laboratory::where('slug', 'lab-09-simulated-host-discovery-service-id')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab9->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'scope_compliance' => [
                'in_scope_target_verified' => true,
                'out_of_scope_avoided' => true,
            ],
            'discovery_interpretation' => [
                'live_hosts_count' => 1,
                'latency_or_status' => '0% packet loss, 0.412ms average latency',
            ],
            'service_inventory' => [
                'ftp_service' => 'vsftpd 2.3.4 (Port 21)',
                'http_service' => 'Apache httpd 2.4.49 (Port 80)',
                'ssh_service' => 'OpenSSH 8.9p1 (Port 22)',
            ],
            'unexpected_exposure' => [
                'backdoor_version_identified' => true,
                'ftp_vulnerability_noted' => 'vsftpd 2.3.4 contains backdoor trigger CVE-2011-2523.',
            ],
            'escalation_note' => 'Immediate escalation to system administration: Host 10.10.10.50 runs backdoored vsftpd 2.3.4.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(25, $attempt->rubric_scores['scope_compliance']);
        $this->assertEquals(20, $attempt->rubric_scores['discovery_interpretation']);
        $this->assertEquals(25, $attempt->rubric_scores['service_inventory']);
        $this->assertEquals(20, $attempt->rubric_scores['unexpected_exposure']);
        $this->assertEquals(10, $attempt->rubric_scores['escalation_note']);
    }

    public function test_laboratory_10_evaluates_100_point_rubric_and_passes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab10 = Laboratory::where('slug', 'lab-10-firewall-rule-analysis-exposure')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab10->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $submissionData = [
            'rubric_submission' => true,
            'traffic_evaluation' => [
                'allow_http_inbound' => true,
                'drop_telnet_inbound' => true,
                'default_deny_enforced' => true,
            ],
            'unsafe_rules' => [
                'rule_exposed_rdp' => true,
                'rule_permissive_telnet' => true,
            ],
            'corrected_policy' => [
                'rdp_restricted_to_vpn' => 'Restricted RDP to internal VPN network 10.10.10.0/24.',
                'inbound_default_drop' => 'Enforced default-deny on WAN interface.',
            ],
            'policy_tests' => ['Port 80 allow', 'Port 3389 drop from WAN', 'Port 23 drop from WAN'],
            'change_record' => 'Ticket #FW-2026-08: Hardened inbound firewall access; removed WAN RDP exposure.',
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);

        $response->assertRedirect(route('simulation.result', $attempt));

        $attempt->refresh();
        $this->assertEquals(AttemptStatus::PASSED, $attempt->status);
        $this->assertTrue($attempt->is_passed);
        $this->assertEquals(100, $attempt->final_score);
        $this->assertEquals(25, $attempt->rubric_scores['traffic_evaluation']);
        $this->assertEquals(25, $attempt->rubric_scores['unsafe_rule_identification']);
        $this->assertEquals(30, $attempt->rubric_scores['corrected_policy']);
        $this->assertEquals(10, $attempt->rubric_scores['policy_testing']);
        $this->assertEquals(10, $attempt->rubric_scores['change_record']);
    }
}
