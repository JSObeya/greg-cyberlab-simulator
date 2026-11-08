<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\Programme;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class McqExamEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $trainee;

    protected Cohort $cohort;

    protected Programme $programme;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'is_active' => true,
        ]);

        $this->trainee = User::factory()->create([
            'role' => UserRole::TRAINEE,
            'is_active' => true,
        ]);

        $this->programme = Programme::create([
            'title' => 'Naval Provost Cyber Defence Programme',
            'slug' => 'naval-provost-cyber-defence',
            'code' => 'NAV-PROV-01',
            'duration' => '3 Weeks',
            'is_active' => true,
        ]);

        $course = Course::create([
            'programme_id' => $this->programme->id,
            'title' => 'Basic Cybersecurity & AI',
            'slug' => 'basic-cybersecurity-ai',
            'code' => 'CYB-101',
            'is_active' => true,
        ]);

        $this->cohort = Cohort::create([
            'programme_id' => $this->programme->id,
            'course_id' => $course->id,
            'name' => 'Cohort Bravo 2026',
            'code' => 'BRAVO-26',
            'max_capacity' => 30,
            'is_active' => true,
            'status' => 'active',
        ]);

        $this->cohort->users()->attach($this->trainee->id, ['enrolled_at' => now()]);
        $this->programme->users()->attach($this->trainee->id, ['enrolled_at' => now()]);
    }

    public function test_staff_can_view_exams_index_and_stats(): void
    {
        $response = $this->actingAs($this->admin)->get(route('exams.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Exams/Index')
            ->has('exams')
            ->has('stats')
            ->has('cohorts')
        );
    }

    public function test_admin_can_create_new_mcq_exam(): void
    {
        $response = $this->actingAs($this->admin)->post(route('exams.store'), [
            'title' => 'Naval Access Control Exam',
            'description' => 'Testing RBAC and CIA Triad application.',
            'category' => 'access_control',
            'cohort_id' => $this->cohort->id,
            'programme_id' => $this->programme->id,
            'time_limit_minutes' => 45,
            'passing_score_percentage' => 75,
            'max_attempts' => 2,
            'randomize_questions' => true,
            'randomize_options' => true,
            'show_correct_answers_after' => true,
            'is_published' => true,
        ]);

        $response->assertRedirect(route('exams.index'));
        $this->assertDatabaseHas('quizzes', [
            'title' => 'Naval Access Control Exam',
            'cohort_id' => $this->cohort->id,
            'passing_score_percentage' => 75,
        ]);
    }

    public function test_admin_can_add_question_to_exam(): void
    {
        $quiz = Quiz::create([
            'title' => 'CIA Triad Assessment',
            'slug' => 'cia-triad-assessment',
            'cohort_id' => $this->cohort->id,
            'time_limit_minutes' => 30,
            'passing_score_percentage' => 70,
            'max_attempts' => 3,
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->admin)->postJson(route('exams.questions.store', $quiz->id), [
            'prompt' => 'Which pillar is violated by ransomware?',
            'points' => 10,
            'explanation' => 'Availability is compromised when assets are encrypted.',
            'options' => [
                ['id' => 'a', 'text' => 'Confidentiality', 'is_correct' => false],
                ['id' => 'b', 'text' => 'Integrity', 'is_correct' => false],
                ['id' => 'c', 'text' => 'Availability', 'is_correct' => true],
            ],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quiz->id,
            'prompt' => 'Which pillar is violated by ransomware?',
            'points' => 10,
        ]);
    }

    public function test_admin_can_download_csv_template(): void
    {
        $response = $this->actingAs($this->admin)->get(route('exams.template-csv'));
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('prompt,option_a,option_b,option_c,option_d,correct_option,points,explanation', $response->streamedContent());
    }

    public function test_admin_can_bulk_import_questions_from_csv(): void
    {
        $quiz = Quiz::create([
            'title' => 'Bulk Import Exam',
            'slug' => 'bulk-import-exam',
            'cohort_id' => $this->cohort->id,
            'time_limit_minutes' => 20,
            'passing_score_percentage' => 70,
            'max_attempts' => 3,
            'is_published' => true,
        ]);

        $csvContent = "prompt,option_a,option_b,option_c,option_d,correct_option,points,explanation\n".
            "\"What factor is a CAC card?\",\"Know\",\"Have\",\"Are\",\"Somewhere\",\"B\",\"10\",\"Physical possession\"\n".
            '"What does OPSEC protect?","Public PR","Operations","Budget","Licensing","B","10","Operational security"';

        $file = UploadedFile::fake()->createWithContent('questions.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('exams.import-csv', $quiz->id), [
            'csv_file' => $file,
        ]);

        $response->assertRedirect(route('exams.index'));
        $this->assertEquals(2, $quiz->questions()->count());
        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quiz->id,
            'prompt' => 'What factor is a CAC card?',
        ]);
    }

    public function test_trainee_can_start_autosave_and_submit_mcq_exam(): void
    {
        $quiz = Quiz::create([
            'title' => 'Live Trainee Exam',
            'slug' => 'live-trainee-exam',
            'cohort_id' => $this->cohort->id,
            'time_limit_minutes' => 30,
            'passing_score_percentage' => 70,
            'max_attempts' => 3,
            'show_correct_answers_after' => true,
            'is_published' => true,
        ]);

        $question = $quiz->questions()->create([
            'prompt' => 'What is 2+2 in binary logic?',
            'points' => 10,
            'options' => [
                ['id' => 'a', 'text' => '0100', 'is_correct' => true],
                ['id' => 'b', 'text' => '0010', 'is_correct' => false],
            ],
            'order' => 1,
            'type' => 'multiple_choice',
        ]);

        // 1. Trainee starts attempt
        $startRes = $this->actingAs($this->trainee)->postJson(route('exams.start', $quiz->id));
        $startRes->assertOk();
        $attemptId = $startRes->json('attempt.id');
        $this->assertNotNull($attemptId);

        $attempt = QuizAttempt::find($attemptId);
        $this->assertEquals('in_progress', $attempt->status);

        // 2. Trainee autosaves answer
        $autosaveRes = $this->actingAs($this->trainee)->postJson(route('exams.autosave', $attempt->id), [
            'answers' => [$question->id => 'a'],
        ]);
        $autosaveRes->assertOk();
        $this->assertEquals('a', $attempt->fresh()->answers_state[$question->id]);

        // 3. Trainee submits attempt
        $submitRes = $this->actingAs($this->trainee)->postJson(route('exams.submit', $attempt->id), [
            'answers' => [$question->id => 'a'],
        ]);
        $submitRes->assertOk();
        $attempt->refresh();
        $this->assertEquals('graded', $attempt->status);
        $this->assertEquals(10, $attempt->total_score);
        $this->assertEquals(100, $attempt->score_percentage);
        $this->assertTrue($attempt->is_passed);

        // 4. Trainee views result dossier
        $resultRes = $this->actingAs($this->trainee)->get(route('exams.result', ['quiz' => $quiz->id, 'attempt' => $attempt->id]));
        $resultRes->assertOk();
        $resultRes->assertInertia(fn ($page) => $page->component('Exams/Result')
            ->where('attempt.is_passed', true)
            ->where('attempt.score_percentage', 100)
            ->has('questions_review')
        );
    }

    public function test_staff_can_view_analytics_and_export_results_csv(): void
    {
        $quiz = Quiz::create([
            'title' => 'Analytics Test Exam',
            'slug' => 'analytics-test-exam',
            'cohort_id' => $this->cohort->id,
            'time_limit_minutes' => 20,
            'passing_score_percentage' => 70,
            'max_attempts' => 1,
            'is_published' => true,
        ]);

        QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->trainee->id,
            'attempt_number' => 1,
            'status' => 'graded',
            'started_at' => now()->subMinutes(15),
            'submitted_at' => now(),
            'total_score' => 80,
            'score_percentage' => 80,
            'is_passed' => true,
        ]);

        // Test Analytics Dashboard
        $analyticsRes = $this->actingAs($this->admin)->get(route('exams.analytics'));
        $analyticsRes->assertOk();
        $analyticsRes->assertInertia(fn ($page) => $page->component('Exams/Analytics')
            ->has('metrics')
            ->has('distribution')
            ->has('recent_results')
        );

        // Test Export CSV
        $exportRes = $this->actingAs($this->admin)->get(route('exams.export-results', ['quiz_id' => $quiz->id]));
        $exportRes->assertOk();
        $exportRes->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $csvOutput = $exportRes->streamedContent();
        $this->assertStringContainsString('Candidate Name', $csvOutput);
        $this->assertStringContainsString('Operational Email', $csvOutput);
        $this->assertStringContainsString($this->trainee->email, $csvOutput);
        $this->assertStringContainsString('PASS', $csvOutput);
    }
}
