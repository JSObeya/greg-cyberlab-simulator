<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Question Banks (Categorized pool of questions for Quizzes & Exams)
        if (! Schema::hasTable('question_banks')) {
            Schema::create('question_banks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title');
                $table->string('category')->default('general'); // network, soc, cryptography, web_sec, forensics
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 2. Bank Questions (Supports MCQ, Multi-select, True/False, Short Answer, Matching)
        if (! Schema::hasTable('bank_questions')) {
            Schema::create('bank_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('question_bank_id')->constrained()->cascadeOnDelete();
                $table->string('type')->default('multiple_choice'); // multiple_choice, multi_select, true_false, short_answer
                $table->text('prompt');
                $table->text('explanation')->nullable();
                $table->integer('points')->default(5);
                $table->string('difficulty')->default('medium'); // easy, medium, hard
                $table->json('options'); // array of options with is_correct flag
                $table->timestamps();
            });
        }

        // 3. Quizzes & Timed Assessments
        if (! Schema::hasTable('quizzes')) {
            Schema::create('quizzes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('instructions')->nullable();
                $table->integer('time_limit_minutes')->default(30); // 0 = unlimited
                $table->integer('passing_score_percentage')->default(70);
                $table->integer('max_attempts')->default(3);
                $table->boolean('randomize_questions')->default(true);
                $table->boolean('randomize_options')->default(true);
                $table->boolean('show_correct_answers_after')->default(true);
                $table->boolean('is_published')->default(true);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 4. Quiz Questions mapping (Can link to Bank Question or custom question)
        if (! Schema::hasTable('quiz_questions')) {
            Schema::create('quiz_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
                $table->foreignId('bank_question_id')->nullable()->constrained()->nullOnDelete();
                $table->text('prompt');
                $table->string('type')->default('multiple_choice');
                $table->integer('points')->default(5);
                $table->integer('order')->default(1);
                $table->json('options');
                $table->text('explanation')->nullable();
                $table->timestamps();
            });
        }

        // 5. Quiz Attempts (Tracks Trainee real-time timer, answers, score)
        if (! Schema::hasTable('quiz_attempts')) {
            Schema::create('quiz_attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->integer('attempt_number')->default(1);
                $table->string('status')->default('in_progress'); // in_progress, submitted, timed_out, graded
                $table->dateTime('started_at')->useCurrent();
                $table->dateTime('expires_at')->nullable();
                $table->dateTime('submitted_at')->nullable();
                $table->json('answers_state')->nullable(); // Autosaved trainee selections
                $table->integer('total_score')->default(0);
                $table->integer('score_percentage')->default(0);
                $table->boolean('is_passed')->default(false);
                $table->timestamps();
            });
        }

        // 6. Assignments & Project Submissions
        if (! Schema::hasTable('assignments')) {
            Schema::create('assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title');
                $table->string('slug')->unique();
                $table->longText('instructions');
                $table->integer('total_points')->default(100);
                $table->dateTime('due_date')->nullable();
                $table->dateTime('cutoff_date')->nullable(); // No submissions after cutoff
                $table->integer('max_file_size_mb')->default(60);
                $table->string('allowed_extensions')->default('pdf,docx,zip,txt,pcap');
                $table->json('rubric')->nullable(); // Criteria breakdown: [{criterion: '...', max_points: 20}]
                $table->boolean('is_published')->default(true);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 7. Assignment Submissions (Supports file attachments, versioning, instructor grading & rubrics)
        if (! Schema::hasTable('assignment_submissions')) {
            Schema::create('assignment_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->integer('version')->default(1);
                $table->text('student_notes')->nullable();
                $table->string('file_path')->nullable();
                $table->string('file_name')->nullable();
                $table->unsignedBigInteger('file_size_bytes')->default(0);
                $table->string('status')->default('submitted'); // submitted, late, graded, returned
                $table->dateTime('submitted_at')->useCurrent();
                $table->integer('awarded_score')->nullable();
                $table->text('instructor_feedback')->nullable();
                $table->json('rubric_breakdown')->nullable();
                $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('graded_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('bank_questions');
        Schema::dropIfExists('question_banks');
    }
};
