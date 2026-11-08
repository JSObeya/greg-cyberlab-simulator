<?php

namespace Tests\Feature;

use App\Enums\LabStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Laboratory;
use App\Models\Programme;
use App\Models\User;
use Database\Seeders\NavalProvostAiProgrammeSeeder;
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

    public function test_naval_provost_programme_seeder_provisions_all_twelve_specialized_labs(): void
    {
        $this->seed(NavalProvostAiProgrammeSeeder::class);

        $this->assertDatabaseCount('laboratories', 12);

        $newModule3Labs = [
            'naval-digital-identity-mfa-passphrase-hardening' => 'NP-LAB 09: Digital Identity Verification, Passphrase Hardening & MFA Defense',
            'naval-account-lifecycle-privileged-credential-triage' => 'NP-LAB 10: Account Lifecycle Management, Privileged Access & Credential Theft Triage',
            'naval-access-control-models-facility-visitor-security' => 'NP-LAB 11: Multi-Model Access Control (DAC/MAC/RBAC/ABAC) & Facility Visitor Security',
            'naval-operation-secure-access-identity-compromise-triage' => 'NP-LAB 12: Operation Secure Access: Identity Compromise Response & Provost Incident Triage',
        ];

        foreach ($newModule3Labs as $slug => $title) {
            $this->assertDatabaseHas('laboratories', [
                'slug' => $slug,
                'title' => $title,
            ]);

            $lab = Laboratory::where('slug', $slug)->first();
            $this->assertNotNull($lab);
            $this->assertNotNull($lab->scenario);
            $this->assertNotEmpty($lab->tasks);
            $this->assertGreaterThanOrEqual(2, $lab->questions()->count());
        }
    }

    public function test_admin_can_approve_pending_user_and_perform_bulk_actions(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SUPER_ADMIN]);
        $pendingUser = User::factory()->pending()->create(['name' => 'Cadet Pending']);
        $trainee2 = User::factory()->create(['role' => UserRole::TRAINEE, 'is_active' => true]);

        // Single approval
        $response = $this->actingAs($admin)->post(route('admin.users.approve', $pendingUser->id));
        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $pendingUser->id,
            'is_active' => true,
        ]);

        // Bulk deactivate
        $response = $this->actingAs($admin)->post(route('admin.users.bulk-action'), [
            'user_ids' => [$pendingUser->id, $trainee2->id],
            'action' => 'deactivate',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $pendingUser->id, 'is_active' => false]);
        $this->assertDatabaseHas('users', ['id' => $trainee2->id, 'is_active' => false]);

        // Bulk approve/activate
        $response = $this->actingAs($admin)->post(route('admin.users.bulk-action'), [
            'user_ids' => [$pendingUser->id, $trainee2->id],
            'action' => 'approve',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $pendingUser->id, 'is_active' => true]);
        $this->assertDatabaseHas('users', ['id' => $trainee2->id, 'is_active' => true]);
    }

    public function test_admin_can_create_update_delete_and_bulk_manage_laboratories(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $programme = Programme::create([
            'title' => 'Naval Provost Cyber Intelligence',
            'slug' => 'naval-provost-cyber-intelligence',
            'code' => 'NP-CI-2026',
            'department' => 'Naval Provost',
            'duration' => '3 Weeks',
            'delivery_mode' => 'hybrid',
            'is_active' => true,
        ]);

        $course = Course::create([
            'programme_id' => $programme->id,
            'title' => 'Tactical Forensics',
            'slug' => 'tactical-forensics',
            'code' => 'TF-101',
            'is_published' => true,
        ]);

        // 1. Create Lab
        $response = $this->actingAs($admin)->post(route('admin.labs.store'), [
            'title' => 'NP-LAB 13: Tactical DNS Threat Hunting',
            'course_id' => $course->id,
            'category' => 'tactical_cyber',
            'difficulty' => 'intermediate',
            'primary_workspace' => 'kali_terminal',
            'estimated_minutes' => 45,
            'passing_score' => 80,
            'scenario_background' => 'Hunting DNS tunneling in naval tactical communications.',
        ]);
        $response->assertRedirect();

        $lab = Laboratory::where('title', 'NP-LAB 13: Tactical DNS Threat Hunting')->first();
        $this->assertNotNull($lab);

        // 2. Update Lab
        $response = $this->actingAs($admin)->put(route('admin.labs.update', $lab->id), [
            'title' => 'NP-LAB 13: Hardened Tactical DNS Hunting',
            'category' => 'tactical_cyber',
            'difficulty' => 'advanced',
            'primary_workspace' => 'packet_inspector',
            'estimated_minutes' => 50,
            'passing_score' => 85,
            'scenario_background' => 'Updated scenario background text.',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('laboratories', [
            'id' => $lab->id,
            'title' => 'NP-LAB 13: Hardened Tactical DNS Hunting',
            'difficulty' => 'advanced',
            'primary_workspace' => 'packet_inspector',
        ]);

        // 3. Bulk Action Lab (Set Difficulty)
        $response = $this->actingAs($admin)->post(route('admin.labs.bulk-action'), [
            'lab_ids' => [$lab->id],
            'action' => 'set_difficulty',
            'difficulty' => 'beginner',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('laboratories', [
            'id' => $lab->id,
            'difficulty' => 'beginner',
        ]);

        // 4. Delete Lab
        $response = $this->actingAs($admin)->delete(route('admin.labs.destroy', $lab->id));
        $response->assertRedirect();
        $this->assertSoftDeleted('laboratories', ['id' => $lab->id]);
    }
}
