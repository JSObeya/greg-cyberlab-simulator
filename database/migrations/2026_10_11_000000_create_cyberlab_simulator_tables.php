<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('trainee')->after('email');
            $table->string('phone')->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('phone');
        });

        // 1. Learning Management Core
        Schema::create('programmes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programme_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('level')->default('beginner');
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('cohorts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cohort_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cohort_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->dateTime('enrolled_at')->useCurrent();
            $table->unique(['cohort_id', 'user_id']);
            $table->timestamps();
        });

        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->integer('order')->default(1);
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->integer('order')->default(1);
            $table->timestamps();
        });

        // 2. Laboratories & Scenarios
        Schema::create('laboratories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('general'); // terminal, phishing, logs, packets, network, soc, incident_response
            $table->string('difficulty')->default('beginner'); // beginner, intermediate, advanced
            $table->integer('estimated_minutes')->default(30);
            $table->integer('passing_score')->default(70);
            $table->integer('max_attempts')->default(3);
            $table->string('status')->default('published');
            $table->longText('scenario_background')->nullable();
            $table->longText('learning_objectives')->nullable();
            $table->longText('safety_notice')->nullable();
            $table->longText('instructions')->nullable();
            $table->longText('expected_findings')->nullable();
            $table->longText('remediation_explanation')->nullable();
            $table->longText('instructor_guide')->nullable();
            $table->json('workbench_config')->nullable(); // workbench state, mock data, preloaded alerts, packets, etc.
            $table->timestamps();
        });

        Schema::create('laboratory_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratory_id')->constrained()->cascadeOnDelete();
            $table->integer('version_number')->default(1);
            $table->json('definition_snapshot');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratory_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->json('initial_state')->nullable();
            $table->json('network_topology')->nullable();
            $table->json('allowed_commands')->nullable(); // Terminal commands and simulated output definitions
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratory_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('multiple_choice'); // multiple_choice, true_false, short_answer, evidence_selection
            $table->text('prompt');
            $table->integer('points')->default(10);
            $table->integer('order')->default(1);
            $table->json('options')->nullable(); // array of {id, text, is_correct, explanation}
            $table->text('correct_answer_explanation')->nullable();
            $table->timestamps();
        });

        // 3. Trainee Attempts & Simulation Execution
        Schema::create('attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('laboratory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cohort_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('in_progress'); // in_progress, submitted, passed, failed, returned_for_correction
            $table->dateTime('started_at')->useCurrent();
            $table->dateTime('submitted_at')->nullable();
            $table->integer('raw_score')->default(0);
            $table->integer('penalties')->default(0);
            $table->integer('final_score')->default(0);
            $table->boolean('is_passed')->default(false);
            $table->text('instructor_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->json('selected_options')->nullable();
            $table->text('text_response')->nullable();
            $table->integer('awarded_points')->default(0);
            $table->boolean('is_correct')->default(false);
            $table->text('feedback')->nullable();
            $table->timestamps();
        });

        Schema::create('attempt_commands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained()->cascadeOnDelete();
            $table->string('command');
            $table->boolean('was_allowed')->default(true);
            $table->text('simulated_output')->nullable();
            $table->dateTime('executed_at')->useCurrent();
        });

        // 4. Badges, Certificates, & Audit
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->default('shield-check');
            $table->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->dateTime('awarded_at')->useCurrent();
            $table->unique(['user_id', 'badge_id']);
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('certificate_number')->unique();
            $table->string('verification_token')->unique();
            $table->integer('score')->default(100);
            $table->date('issued_date');
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('attempt_commands');
        Schema::dropIfExists('attempt_answers');
        Schema::dropIfExists('attempts');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('scenarios');
        Schema::dropIfExists('laboratory_versions');
        Schema::dropIfExists('laboratories');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('cohort_user');
        Schema::dropIfExists('cohorts');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('programmes');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'is_active']);
        });
    }
};
