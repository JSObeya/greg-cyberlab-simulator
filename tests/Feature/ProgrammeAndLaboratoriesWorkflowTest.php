<?php

namespace Tests\Feature;

use App\Enums\LabStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Laboratory;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgrammeAndLaboratoriesWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_renders_without_quick_demonstration_credentials(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertDontSee('QUICK DEMONSTRATION CREDENTIALS');
        $response->assertDontSee('CyberAdmin2026!');
        $response->assertDontSee('Instructor2026!');
        $response->assertDontSee('Trainee2026!');
    }

    public function test_authenticated_user_can_access_dedicated_labs_index_page(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::TRAINEE,
        ]);

        $programme = Programme::create([
            'title' => 'Basic Cybersecurity and Artificial Intelligence for Security Personnel',
            'slug' => 'basic-cybersecurity-ai-security-personnel',
            'code' => 'BCAI-SEC-2026',
            'department' => 'Naval Provost',
            'duration' => '6 Weeks',
            'delivery_mode' => 'hybrid',
            'is_active' => true,
        ]);

        $course = Course::create([
            'programme_id' => $programme->id,
            'title' => 'Naval Tactical Cybersecurity',
            'slug' => 'naval-tactical-cybersecurity',
            'code' => 'NAV-101',
            'is_published' => true,
        ]);

        $lab = Laboratory::create([
            'course_id' => $course->id,
            'title' => 'NP-LAB 01: Cyber Warfare & Maritime Operational Threat Surface Assessment',
            'slug' => 'naval-cyber-warfare-threat-surface-assessment',
            'category' => 'tactical_cyber',
            'difficulty' => 'beginner',
            'estimated_minutes' => 45,
            'passing_score' => 70,
            'status' => LabStatus::PUBLISHED,
            'primary_workspace' => 'kali_terminal',
            'scenario_background' => 'Naval Provost surface assessment scenario.',
            'learning_objectives' => 'Threat surface evaluation',
            'safety_notice' => 'Safe sandbox',
            'instructions' => 'Run terminal commands',
            'expected_findings' => 'Telnet detected',
            'remediation_explanation' => 'Close port 23',
        ]);

        $response = $this->actingAs($user)->get(route('labs.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Labs/Index')
            ->has('laboratories')
            ->has('programmes')
            ->has('stats')
        );
    }

    public function test_admin_can_assign_users_to_programme(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN,
        ]);

        $trainee1 = User::factory()->create(['role' => UserRole::TRAINEE]);
        $trainee2 = User::factory()->create(['role' => UserRole::TRAINEE]);

        $programme = Programme::create([
            'title' => 'Basic Cybersecurity and Artificial Intelligence for Security Personnel',
            'slug' => 'basic-cybersecurity-ai-security-personnel',
            'code' => 'BCAI-SEC-2026',
            'department' => 'Naval Provost',
            'duration' => '6 Weeks',
            'delivery_mode' => 'hybrid',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.programmes.assign-users', $programme->id), [
            'user_ids' => [$trainee1->id, $trainee2->id],
            'status' => 'active',
            'notes' => 'Provost cohort batch assignment',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('programme_user', [
            'programme_id' => $programme->id,
            'user_id' => $trainee1->id,
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('programme_user', [
            'programme_id' => $programme->id,
            'user_id' => $trainee2->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_remove_user_from_programme(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);

        $trainee = User::factory()->create(['role' => UserRole::TRAINEE]);

        $programme = Programme::create([
            'title' => 'Basic Cybersecurity and Artificial Intelligence for Security Personnel',
            'slug' => 'basic-cybersecurity-ai-security-personnel',
            'code' => 'BCAI-SEC-2026',
            'department' => 'Naval Provost',
            'duration' => '6 Weeks',
            'delivery_mode' => 'hybrid',
            'is_active' => true,
        ]);

        $programme->users()->attach($trainee->id, ['enrolled_at' => now(), 'status' => 'active']);

        $this->assertDatabaseHas('programme_user', [
            'programme_id' => $programme->id,
            'user_id' => $trainee->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.programmes.remove-user', [$programme->id, $trainee->id]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('programme_user', [
            'programme_id' => $programme->id,
            'user_id' => $trainee->id,
        ]);
    }
}
