<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\Certificate;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\CourseGrade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LmsGradebookAndCertificatesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_instructor_can_record_cohort_attendance(): void
    {
        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $cohort = Cohort::first();

        $response = $this->actingAs($instructor)->postJson(route('cohorts.attendance.record', $cohort), [
            'session_date' => '2026-10-12',
            'session_type' => 'lab',
            'records' => [
                [
                    'user_id' => $trainee->id,
                    'status' => 'present',
                    'remarks' => 'Completed Wireshark packet capture analysis on time.',
                ],
            ],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('attendance_records', [
            'cohort_id' => $cohort->id,
            'user_id' => $trainee->id,
            'status' => 'present',
        ]);
    }

    public function test_instructor_can_calculate_weighted_final_grade(): void
    {
        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $response = $this->actingAs($instructor)->postJson(route('grades.calculate', ['course' => $course, 'trainee' => $trainee]), [
            'labs_score' => 90,
            'quizzes_score' => 85,
            'assignments_score' => 95,
            'attendance_score' => 100,
        ]);

        $response->assertStatus(200);

        // Weighted: 90*0.4 (36) + 85*0.2 (17) + 95*0.3 (28.5) + 100*0.1 (10) = 91.5 => Grade A
        $this->assertDatabaseHas('course_grades', [
            'course_id' => $course->id,
            'user_id' => $trainee->id,
            'letter_grade' => 'A',
            'status' => 'submitted_for_moderation',
            'is_certificate_eligible' => true,
        ]);
    }

    public function test_academic_coordinator_can_moderate_grades(): void
    {
        $coordinator = User::where('role', UserRole::ACADEMIC_COORDINATOR)->first();
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $grade = CourseGrade::create([
            'course_id' => $course->id,
            'user_id' => $trainee->id,
            'labs_score' => 88,
            'quizzes_score' => 80,
            'assignments_score' => 85,
            'attendance_score' => 95,
            'final_score' => 86.2,
            'letter_grade' => 'A',
            'status' => 'submitted_for_moderation',
            'is_certificate_eligible' => true,
        ]);

        $response = $this->actingAs($coordinator)->post(route('grades.moderate', $grade), [
            'decision' => 'moderated',
            'moderation_comments' => 'Academic requirements confirmed and validated for credential issuance.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('course_grades', [
            'id' => $grade->id,
            'status' => 'moderated',
            'moderated_by' => $coordinator->id,
        ]);
    }

    public function test_public_certificate_verification_returns_accurate_metadata(): void
    {
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $cert = Certificate::create([
            'user_id' => $trainee->id,
            'course_id' => $course->id,
            'certificate_number' => 'GREG-CYBER-2026-TEST',
            'verification_token' => 'test-valid-hash-token-999',
            'score' => 94,
            'letter_grade' => 'A',
            'issued_date' => now(),
        ]);

        $response = $this->get(route('certificate.verify', 'test-valid-hash-token-999'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Certificate/Verify')
                ->where('certificate.certificate_number', 'GREG-CYBER-2026-TEST')
                ->where('certificate.recipient_name', $trainee->name)
                ->where('certificate.letter_grade', 'A')
                ->where('certificate.is_valid', true)
            );
    }
}
