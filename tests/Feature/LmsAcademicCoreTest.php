<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicSession;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LmsAcademicCoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_academic_session_and_programme_are_seeded(): void
    {
        $session = AcademicSession::where('code', 'AY-2026-27')->first();
        $this->assertNotNull($session);
        $this->assertTrue($session->is_current);

        $programme = Programme::where('code', 'DCD-2026')->first();
        $this->assertNotNull($programme);
        $this->assertEquals('Diploma in Cyber Defense & SOC Operations', $programme->title);
        $this->assertNotNull($programme->coordinator);
    }

    public function test_course_belongs_to_programme_and_has_instructors(): void
    {
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();
        $this->assertNotNull($course);
        $this->assertNotNull($course->programme);
        $this->assertEquals('published', $course->status);
        $this->assertTrue($course->isPublished());
        $this->assertGreaterThanOrEqual(1, $course->instructors()->count());
    }

    public function test_cohort_links_programme_session_and_instructors(): void
    {
        $cohort = Cohort::where('code', 'MAK-2026-ALPHA')->first();
        $this->assertNotNull($cohort);
        $this->assertNotNull($cohort->programme);
        $this->assertNotNull($cohort->academicSession);
        $this->assertGreaterThanOrEqual(1, $cohort->instructors()->count());
        $this->assertGreaterThanOrEqual(1, $cohort->users()->count());
    }

    public function test_admin_can_access_and_create_academic_programme(): void
    {
        $admin = User::where('role', UserRole::SUPER_ADMIN)->first();

        $response = $this->actingAs($admin)->get(route('admin.programmes.index'));
        $response->assertStatus(200);

        $newProgData = [
            'title' => 'Certificate in Offensive PenTesting',
            'code' => 'CPT-2026',
            'department' => 'Red Team Research',
            'duration' => '6 Weeks',
            'delivery_mode' => 'in_person',
            'coordinator_id' => $admin->id,
            'description' => 'Advanced penetration testing and ethical hacking lab programme.',
        ];

        $postResponse = $this->actingAs($admin)->post(route('admin.programmes.store'), $newProgData);
        $postResponse->assertRedirect();

        $this->assertDatabaseHas('programmes', [
            'code' => 'CPT-2026',
            'title' => 'Certificate in Offensive PenTesting',
        ]);
    }

    public function test_trainee_is_forbidden_from_creating_programmes(): void
    {
        $trainee = User::where('role', UserRole::TRAINEE)->first();

        $response = $this->actingAs($trainee)->get(route('admin.programmes.index'));
        $response->assertStatus(403);

        $postResponse = $this->actingAs($trainee)->post(route('admin.programmes.store'), [
            'title' => 'Unauthorized Programme',
            'code' => 'UNAUTH-01',
            'department' => 'Security',
            'duration' => '1 Month',
            'delivery_mode' => 'online',
        ]);
        $postResponse->assertStatus(403);
    }

    public function test_admin_can_update_academic_programme(): void
    {
        $admin = User::where('role', UserRole::SUPER_ADMIN)->first();
        $programme = Programme::first();

        $updateData = [
            'title' => 'Updated Cyber Operations Programme',
            'code' => $programme->code,
            'department' => 'Advanced Cyber Defence',
            'duration' => '4 Months (Specialized)',
            'delivery_mode' => 'hybrid',
            'coordinator_id' => $admin->id,
            'description' => 'Updated curriculum description with advanced simulated operations.',
            'entry_requirements' => 'Prerequisite completed.',
            'objectives' => 'Master cyber defence protocols.',
            'is_active' => true,
        ];

        $response = $this->actingAs($admin)->put(route('admin.programmes.update', $programme), $updateData);
        $response->assertRedirect();

        $programme->refresh();
        $this->assertEquals('Updated Cyber Operations Programme', $programme->title);
        $this->assertEquals('Advanced Cyber Defence', $programme->department);
    }

    public function test_admin_can_update_cohort(): void
    {
        $admin = User::where('role', UserRole::SUPER_ADMIN)->first();
        $cohort = Cohort::first();

        $updateData = [
            'course_id' => $cohort->course_id,
            'programme_id' => $cohort->programme_id,
            'academic_session_id' => $cohort->academic_session_id,
            'name' => 'Renamed Cyber Cadets Cohort',
            'code' => $cohort->code,
            'start_date' => '2026-11-01',
            'end_date' => '2027-02-28',
            'max_capacity' => 45,
            'status' => 'active',
            'is_active' => true,
        ];

        $response = $this->actingAs($admin)->put(route('cohorts.update', $cohort), $updateData);
        $response->assertRedirect();

        $cohort->refresh();
        $this->assertEquals('Renamed Cyber Cadets Cohort', $cohort->name);
        $this->assertEquals(45, $cohort->max_capacity);
    }
}
