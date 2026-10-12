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
        // 1. Enhance Modules with learning outcomes, estimated duration, availability, and soft deletes
        Schema::table('modules', function (Blueprint $table) {
            if (! Schema::hasColumn('modules', 'learning_outcomes')) {
                $table->text('learning_outcomes')->nullable()->after('description');
            }
            if (! Schema::hasColumn('modules', 'estimated_minutes')) {
                $table->integer('estimated_minutes')->default(60)->after('learning_outcomes');
            }
            if (! Schema::hasColumn('modules', 'is_locked')) {
                $table->boolean('is_locked')->default(false)->after('estimated_minutes');
            }
            if (! Schema::hasColumn('modules', 'prerequisite_module_id')) {
                $table->foreignId('prerequisite_module_id')->nullable()->after('is_locked')->constrained('modules')->nullOnDelete();
            }
            if (! Schema::hasColumn('modules', 'deleted_at')) {
                $table->softDeletes()->after('order');
            }
        });

        // 2. Enhance Lessons with lesson summaries, key terms, estimated study time, video embeds, and soft deletes
        Schema::table('lessons', function (Blueprint $table) {
            if (! Schema::hasColumn('lessons', 'summary')) {
                $table->text('summary')->nullable()->after('slug');
            }
            if (! Schema::hasColumn('lessons', 'objectives')) {
                $table->text('objectives')->nullable()->after('summary');
            }
            if (! Schema::hasColumn('lessons', 'estimated_study_minutes')) {
                $table->integer('estimated_study_minutes')->default(30)->after('objectives');
            }
            if (! Schema::hasColumn('lessons', 'video_embed_url')) {
                $table->string('video_embed_url')->nullable()->after('estimated_study_minutes');
            }
            if (! Schema::hasColumn('lessons', 'video_provider')) {
                $table->string('video_provider')->nullable()->after('video_embed_url'); // youtube, vimeo, local
            }
            if (! Schema::hasColumn('lessons', 'audio_url')) {
                $table->string('audio_url')->nullable()->after('video_provider');
            }
            if (! Schema::hasColumn('lessons', 'is_free_preview')) {
                $table->boolean('is_free_preview')->default(false)->after('audio_url');
            }
            if (! Schema::hasColumn('lessons', 'drip_days')) {
                $table->integer('drip_days')->default(0)->after('is_free_preview'); // Days after enrollment to unlock
            }
            if (! Schema::hasColumn('lessons', 'deleted_at')) {
                $table->softDeletes()->after('order');
            }
        });

        // 3. Learning Resources (PDFs, PPTXs, DOCXs, Worksheets, Cheat Sheets)
        if (! Schema::hasTable('learning_resources')) {
            Schema::create('learning_resources', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('module_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('lesson_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('file_path');
                $table->string('file_name');
                $table->string('file_type', 50); // pdf, pptx, docx, txt, zip
                $table->string('mime_type', 100);
                $table->unsignedBigInteger('file_size_bytes')->default(0);
                $table->integer('download_count')->default(0);
                $table->boolean('is_downloadable')->default(true);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 4. Learning Activities (Polymorphic bridge connecting Lessons with Labs, Quizzes, Assignments, Readings)
        if (! Schema::hasTable('learning_activities')) {
            Schema::create('learning_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
                $table->string('title');
                $table->string('activity_type'); // laboratory, quiz, assignment, reading, video, presentation
                $table->unsignedBigInteger('activity_entity_id')->nullable(); // ID of linked laboratory, quiz, assignment
                $table->string('activity_entity_type')->nullable(); // Class name or identifier
                $table->integer('order')->default(1);
                $table->integer('estimated_minutes')->default(20);
                $table->boolean('is_mandatory')->default(true);
                $table->integer('points')->default(100);
                $table->timestamps();
            });
        }

        // 5. Course Publication Review Logs (Review Audit Trail)
        if (! Schema::hasTable('course_reviews')) {
            Schema::create('course_reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Reviewer
                $table->string('from_status');
                $table->string('to_status');
                $table->text('comments')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations safely.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_reviews');
        Schema::dropIfExists('learning_activities');
        Schema::dropIfExists('learning_resources');

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn([
                'summary',
                'objectives',
                'estimated_study_minutes',
                'video_embed_url',
                'video_provider',
                'audio_url',
                'is_free_preview',
                'drip_days',
                'deleted_at',
            ]);
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->dropForeign(['prerequisite_module_id']);
            $table->dropColumn([
                'learning_outcomes',
                'estimated_minutes',
                'is_locked',
                'prerequisite_module_id',
                'deleted_at',
            ]);
        });
    }
};
