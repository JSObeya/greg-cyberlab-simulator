<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Course;
use App\Models\LearningResource;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LmsCourseWorkflowAndResourcesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_instructor_can_submit_course_for_review(): void
    {
        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $course->update(['status' => 'draft']);

        $response = $this->actingAs($instructor)->post(route('courses.submit-review', $course), [
            'comments' => 'Completed all module objectives and ready for coordinator review.',
        ]);

        $response->assertRedirect();
        $course->refresh();
        $this->assertEquals('review', $course->status);
        $this->assertDatabaseHas('course_reviews', [
            'course_id' => $course->id,
            'user_id' => $instructor->id,
            'to_status' => 'review',
        ]);
    }

    public function test_academic_coordinator_can_approve_and_publish_course(): void
    {
        $coordinator = User::where('role', UserRole::ACADEMIC_COORDINATOR)->first();
        $course = Course::where('slug', 'cybersecurity-fundamentals-soc-triage')->first();

        $course->update(['status' => 'review']);

        $response = $this->actingAs($coordinator)->post(route('courses.approve-publish', $course), [
            'comments' => 'Syllabus verified against official academy training guidelines.',
        ]);

        $response->assertRedirect();
        $course->refresh();
        $this->assertEquals('published', $course->status);
        $this->assertTrue($course->is_published);
        $this->assertEquals($coordinator->id, $course->approved_by);
        $this->assertNotNull($course->published_at);
    }

    public function test_instructor_can_upload_valid_document_resource(): void
    {
        Storage::fake('local');

        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $lesson = Lesson::first();

        $file = UploadedFile::fake()->create('soc_triage_cheatsheet.pdf', 500, 'application/pdf');

        $response = $this->actingAs($instructor)->post(route('resources.store', $lesson), [
            'title' => 'Official SOC Triage Reference Cheatsheet',
            'description' => 'Fast reference guide for memory dumping and SIEM queries.',
            'file' => $file,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('learning_resources', [
            'lesson_id' => $lesson->id,
            'title' => 'Official SOC Triage Reference Cheatsheet',
            'file_name' => 'soc_triage_cheatsheet.pdf',
            'file_type' => 'pdf',
        ]);

        $resource = LearningResource::where('title', 'Official SOC Triage Reference Cheatsheet')->first();
        Storage::disk('local')->assertExists($resource->file_path);
    }

    public function test_uploader_rejects_unsafe_executable_file_types(): void
    {
        Storage::fake('local');

        $instructor = User::where('role', UserRole::INSTRUCTOR)->first();
        $lesson = Lesson::first();

        $dangerousFile = UploadedFile::fake()->create('malicious_payload.exe', 100, 'application/x-msdownload');

        $response = $this->actingAs($instructor)->post(route('resources.store', $lesson), [
            'title' => 'Malicious Executable',
            'file' => $dangerousFile,
        ]);

        $response->assertSessionHasErrors(['file']);
        $this->assertDatabaseMissing('learning_resources', [
            'title' => 'Malicious Executable',
        ]);
    }

    public function test_trainee_can_download_learning_resource(): void
    {
        Storage::fake('local');

        $trainee = User::where('role', UserRole::TRAINEE)->first();
        $lesson = Lesson::first();

        $storedPath = 'learning_resources/sample_worksheet.pdf';
        Storage::disk('local')->put($storedPath, 'Sample educational PDF content');

        $resource = LearningResource::create([
            'course_id' => $lesson->module->course_id,
            'module_id' => $lesson->module_id,
            'lesson_id' => $lesson->id,
            'title' => 'Network Packet Worksheet',
            'file_path' => $storedPath,
            'file_name' => 'sample_worksheet.pdf',
            'file_type' => 'pdf',
            'mime_type' => 'application/pdf',
            'file_size_bytes' => 1024,
            'is_downloadable' => true,
        ]);

        $response = $this->actingAs($trainee)->get(route('resources.download', $resource));
        $response->assertStatus(200);

        $resource->refresh();
        $this->assertEquals(1, $resource->download_count);
    }
}
