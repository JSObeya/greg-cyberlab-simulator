<?php

namespace Tests\Feature;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Laboratory1CurriculumWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_trainee_can_autosave_lab1_progress(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab1 = Laboratory::where('slug', 'lab-01-orientation-rules')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab1->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $response = $this->actingAs($trainee)->postJson(route('simulation.autosave', $attempt), [
            'state' => [
                'scope_answers' => ['subnet' => '192.168.50.0/24'],
                'activity_classifications' => ['card_port_scan_in_scope' => 'permitted'],
            ],
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertEquals(
            '192.168.50.0/24',
            $attempt->fresh()->autosaved_state['scope_answers']['subnet']
        );
    }

    public function test_trainee_can_digitally_acknowledge_safety_rules_of_engagement(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab1 = Laboratory::where('slug', 'lab-01-orientation-rules')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab1->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        $response = $this->actingAs($trainee)->postJson(route('simulation.acknowledge-safety', $attempt), [
            'version' => '1.0.0',
        ]);

        $response->assertOk();
        $this->assertNotNull($attempt->fresh()->safety_acknowledged_at);
        $this->assertEquals('1.0.0', $attempt->fresh()->policy_version);
    }

    public function test_lab1_100_point_rubric_evaluation_and_80_percent_pass_mark(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab1 = Laboratory::where('slug', 'lab-01-orientation-rules')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab1->id,
            'status' => AttemptStatus::IN_PROGRESS,
        ]);

        // Submit complete compliant answers (100 out of 100 points)
        $submissionData = [
            'rubric_submission' => true,
            'scope_answers' => [
                'subnet' => '192.168.50.0/24',
                'window_identified' => true,
                'external_out_of_scope' => true,
            ],
            'activity_classifications' => [
                'card_port_scan_in_scope' => 'permitted',
                'card_bruteforce_hostinger_cpanel' => 'prohibited',
                'card_external_link_probe' => 'prohibited',
                'card_unlisted_vuln_script' => 'ask_instructor',
                'card_capture_http_headers' => 'permitted',
            ],
            'cia_matches' => [
                'incident_unauth_data_leak' => 'confidentiality',
                'incident_grade_tampering' => 'integrity',
                'incident_auth_portal_dos' => 'availability',
            ],
            'evidence_record' => [
                'date' => '2026-10-11',
                'time' => '10:00',
                'trainee' => $trainee->name,
                'source' => 'Engagement Charter',
                'observation' => 'Observed 192.168.50.0/24 as the sole authorized testing target in brief.',
                'conclusion' => 'Probing external IP addresses or server management interfaces is prohibited.',
                'action' => 'Documented authorized boundaries prior to commencing security scan.',
            ],
            'safety_acknowledged' => true,
        ];

        $response = $this->actingAs($trainee)->post(route('simulation.submit', $attempt), $submissionData);
        $response->assertRedirect(route('simulation.result', $attempt));

        $freshAttempt = $attempt->fresh();
        $this->assertTrue($freshAttempt->is_passed);
        $this->assertEquals(100, $freshAttempt->final_score);
        $this->assertEquals(AttemptStatus::PASSED, $freshAttempt->status);
        $this->assertEquals(20, $freshAttempt->rubric_scores['scope_identification']);
        $this->assertEquals(30, $freshAttempt->rubric_scores['activity_classification']);
        $this->assertEquals(20, $freshAttempt->rubric_scores['cia_matching']);
        $this->assertEquals(20, $freshAttempt->rubric_scores['evidence_record']);
        $this->assertEquals(10, $freshAttempt->rubric_scores['safety_acknowledgement']);
    }

    public function test_prerequisite_locking_blocks_access_to_lab2_until_lab1_passed_with_80_percent(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab2 = Laboratory::where('id', '>', 1)->first();

        // Trainee has NOT completed Lab 1 yet
        $response = $this->actingAs($trainee)->get(route('simulation.show', $lab2->slug));

        // Must redirect back to curriculum with prerequisite requirement error
        $response->assertRedirect(route('courses.index'));
        $response->assertSessionHas('error');
    }

    public function test_passing_lab1_with_80_percent_unlocks_lab2_for_trainee(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab1 = Laboratory::where('slug', 'lab-01-orientation-rules')->first();
        $lab2 = Laboratory::where('id', '>', 1)->first();

        // Seed passed attempt with 85% for Lab 1
        Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab1->id,
            'status' => AttemptStatus::PASSED,
            'is_passed' => true,
            'final_score' => 85,
        ]);

        // Trainee now attempts to access Lab 2
        $response = $this->actingAs($trainee)->get(route('simulation.show', $lab2->slug));

        // Access is granted successfully
        $response->assertOk();
    }

    public function test_trainee_can_safely_reset_attempt_state(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab1 = Laboratory::where('slug', 'lab-01-orientation-rules')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab1->id,
            'status' => AttemptStatus::IN_PROGRESS,
            'autosaved_state' => ['draft' => 'some progress'],
        ]);

        $response = $this->actingAs($trainee)->post(route('simulation.reset', $attempt));

        $response->assertRedirect(route('simulation.show', $lab1->slug));
        $this->assertNull($attempt->fresh()->autosaved_state);
        $this->assertEquals(AttemptStatus::IN_PROGRESS, $attempt->fresh()->status);
    }
}
