<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\ProgressRecord;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LmsTraineeExperienceAndAssessmentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_trainee_can_update_lesson_progress(): void
    {
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();
        $lesson = Lesson::whereHas('module', function ($q) use ($course) {
            $q->where('course_id', $course->id);
        })->first();

        $response = $this->actingAs($trainee)->postJson(route('lessons.progress', $lesson), [
            'status' => 'completed',
            'time_spent_seconds' => 120,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'completed_lessons' => 1,
            ]);

        $this->assertDatabaseHas('progress_records', [
            'user_id' => $trainee->id,
            'lesson_id' => $lesson->id,
            'status' => 'completed',
            'progress_percentage' => 100,
        ]);
    }

    public function test_instructor_can_post_course_announcement(): void
    {
        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $response = $this->actingAs($instructor)->post(route('courses.announcements.store', $course), [
            'title' => 'Important Lab Schedule Update',
            'content' => 'All students must complete Lab 04 by Friday midnight.',
            'priority' => 'urgent',
            'is_pinned' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'course_id' => $course->id,
            'title' => 'Important Lab Schedule Update',
            'priority' => 'urgent',
            'is_pinned' => true,
        ]);
    }

    public function test_trainee_can_start_autosave_and_submit_quiz(): void
    {
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();
        $quiz = Quiz::create([
            'course_id' => $course->id,
            'title' => 'Network Defense Knowledge Check',
            'slug' => 'network-defense-quiz',
            'time_limit_minutes' => 15,
            'passing_score_percentage' => 70,
        ]);

        $q1 = QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'prompt' => 'Which protocol is used for secure shell access?',
            'points' => 10,
            'options' => [
                ['id' => 'a', 'text' => 'Telnet', 'is_correct' => false],
                ['id' => 'b', 'text' => 'SSH (Port 22)', 'is_correct' => true],
            ],
        ]);

        // 1. Start attempt
        $startRes = $this->actingAs($trainee)->postJson(route('quizzes.attempt', $quiz));
        $startRes->assertStatus(200);
        $attemptId = $startRes->json('attempt.id');

        // 2. Autosave answer
        $attempt = QuizAttempt::find($attemptId);
        $autosaveRes = $this->actingAs($trainee)->postJson(route('quizzes.autosave', $attempt), [
            'answers' => [$q1->id => 'b'],
        ]);
        $autosaveRes->assertStatus(200);

        // 3. Submit attempt
        $submitRes = $this->actingAs($trainee)->postJson(route('quizzes.submit', $attempt), [
            'answers' => [$q1->id => 'b'],
        ]);
        $submitRes->assertStatus(200)
            ->assertJson([
                'total_score' => 10,
                'score_percentage' => 100,
                'is_passed' => true,
            ]);

        $this->assertDatabaseHas('quiz_attempts', [
            'id' => $attemptId,
            'status' => 'graded',
            'total_score' => 10,
            'is_passed' => true,
        ]);
    }

    public function test_trainee_can_submit_assignment_and_instructor_can_grade_with_rubric(): void
    {
        Storage::fake('local');
        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $assignment = Assignment::create([
            'course_id' => $course->id,
            'title' => 'SOC Incident Triage Report',
            'slug' => 'soc-triage-report',
            'instructions' => 'Submit full Wireshark analysis report.',
            'total_points' => 100,
            'max_file_size_mb' => 60,
        ]);

        $file = UploadedFile::fake()->create('triage_analysis.pdf', 500, 'application/pdf');

        $response = $this->actingAs($trainee)->post(route('assignments.submit', $assignment), [
            'file' => $file,
            'student_notes' => 'Completed Wireshark capture analysis.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $assignment->id,
            'user_id' => $trainee->id,
            'version' => 1,
            'file_name' => 'triage_analysis.pdf',
        ]);

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)->first();

        // Grade by instructor
        $gradeResponse = $this->actingAs($instructor)->post(route('assignments.grade', $submission), [
            'awarded_score' => 95,
            'instructor_feedback' => 'Excellent packet trace breakdown.',
            'rubric_breakdown' => [
                'Packet Analysis' => 50,
                'Remediation Plan' => 45,
            ],
        ]);

        $gradeResponse->assertRedirect();
        $this->assertDatabaseHas('assignment_submissions', [
            'id' => $submission->id,
            'status' => 'graded',
            'awarded_score' => 95,
            'graded_by' => $instructor->id,
        ]);
    }
}
