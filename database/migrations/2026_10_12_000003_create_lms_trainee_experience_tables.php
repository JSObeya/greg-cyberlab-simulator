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
        // 1. Progress Records (Course, Module, Lesson, Activity tracking for Trainees)
        if (! Schema::hasTable('progress_records')) {
            Schema::create('progress_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('module_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('lesson_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('learning_activity_id')->nullable()->constrained()->nullOnDelete();
                $table->string('status')->default('in_progress'); // not_started, in_progress, completed
                $table->integer('progress_percentage')->default(0); // 0-100
                $table->integer('time_spent_seconds')->default(0);
                $table->dateTime('completed_at')->nullable();
                $table->timestamps();

                $table->unique(['user_id', 'lesson_id']);
                $table->index(['user_id', 'course_id']);
            });
        }

        // 2. Announcements (Cohort / Course-wide broadcasts by Instructors/Admins)
        if (! Schema::hasTable('announcements')) {
            Schema::create('announcements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Author
                $table->foreignId('course_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('title');
                $table->longText('content');
                $table->string('priority')->default('normal'); // low, normal, urgent
                $table->boolean('is_pinned')->default(false);
                $table->dateTime('published_at')->useCurrent();
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 3. Discussion Forums & Threads
        if (! Schema::hasTable('discussions')) {
            Schema::create('discussions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('lesson_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Initiator
                $table->string('title');
                $table->text('body');
                $table->boolean('is_pinned')->default(false);
                $table->boolean('is_locked')->default(false);
                $table->integer('views_count')->default(0);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('discussion_posts')) {
            Schema::create('discussion_posts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('discussion_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('parent_id')->nullable()->constrained('discussion_posts')->nullOnDelete(); // Threaded reply
                $table->text('body');
                $table->boolean('is_solution')->default(false);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 4. Calendar Events (Schedules, deadlines, live sessions, office hours)
        if (! Schema::hasTable('calendar_events')) {
            Schema::create('calendar_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Creator
                $table->foreignId('course_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('event_type')->default('lecture'); // lecture, lab_deadline, exam, office_hour, webinar
                $table->dateTime('start_time');
                $table->dateTime('end_time');
                $table->string('meeting_url')->nullable();
                $table->string('location')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('discussion_posts');
        Schema::dropIfExists('discussions');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('progress_records');
    }
};
