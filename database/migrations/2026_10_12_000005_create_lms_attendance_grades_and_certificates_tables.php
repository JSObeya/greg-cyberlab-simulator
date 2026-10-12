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
        // 1. Attendance Records (Class session attendance tracking per trainee)
        if (! Schema::hasTable('attendance_records')) {
            Schema::create('attendance_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cohort_id')->constrained()->cascadeOnDelete();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Trainee
                $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete(); // Instructor/TA
                $table->date('session_date');
                $table->string('status')->default('present'); // present, absent, late, excused
                $table->string('session_type')->default('lecture'); // lecture, lab, practical, webinar
                $table->text('remarks')->nullable();
                $table->timestamps();

                $table->unique(['cohort_id', 'user_id', 'session_date', 'session_type'], 'attend_cohort_user_date_type_unique');
            });
        }

        // 2. Gradebook Items (Defines components of course final grade with weights)
        if (! Schema::hasTable('gradebook_items')) {
            Schema::create('gradebook_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->string('title');
                $table->string('item_type'); // lab, quiz, assignment, examination, attendance, participation
                $table->unsignedBigInteger('item_id')->nullable(); // Polymorphic pointer to laboratory_id, quiz_id, or assignment_id
                $table->integer('max_points')->default(100);
                $table->decimal('weight_percentage', 5, 2)->default(20.00); // E.g., 20%
                $table->timestamps();
            });
        }

        // 3. Trainee Final Grades & Academic Moderation
        if (! Schema::hasTable('course_grades')) {
            Schema::create('course_grades', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cohort_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Trainee
                $table->decimal('labs_score', 5, 2)->default(0.00);
                $table->decimal('quizzes_score', 5, 2)->default(0.00);
                $table->decimal('assignments_score', 5, 2)->default(0.00);
                $table->decimal('attendance_score', 5, 2)->default(100.00);
                $table->decimal('final_score', 5, 2)->default(0.00);
                $table->string('letter_grade', 5)->default('F'); // A, B, C, D, F
                $table->string('status')->default('draft'); // draft, submitted_for_moderation, moderated, published
                $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('moderated_at')->nullable();
                $table->text('moderation_comments')->nullable();
                $table->boolean('is_certificate_eligible')->default(false);
                $table->timestamps();

                $table->unique(['course_id', 'user_id']);
            });
        }

        // 4. Enhance Certificates with Programme link, Academic Session, Cohort, Grade, and Template Data
        Schema::table('certificates', function (Blueprint $table) {
            if (! Schema::hasColumn('certificates', 'programme_id')) {
                $table->foreignId('programme_id')->nullable()->after('course_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('certificates', 'cohort_id')) {
                $table->foreignId('cohort_id')->nullable()->after('programme_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('certificates', 'academic_session_id')) {
                $table->foreignId('academic_session_id')->nullable()->after('cohort_id')->constrained('academic_sessions')->nullOnDelete();
            }
            if (! Schema::hasColumn('certificates', 'letter_grade')) {
                $table->string('letter_grade', 5)->default('A')->after('score');
            }
            if (! Schema::hasColumn('certificates', 'issued_by')) {
                $table->foreignId('issued_by')->nullable()->after('issued_date')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('certificates', 'metadata')) {
                $table->json('metadata')->nullable()->after('issued_by'); // Signatory names, competencies achieved
            }
            if (! Schema::hasColumn('certificates', 'deleted_at')) {
                $table->softDeletes()->after('metadata');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropForeign(['programme_id']);
            $table->dropForeign(['cohort_id']);
            $table->dropForeign(['academic_session_id']);
            $table->dropForeign(['issued_by']);
            $table->dropColumn(['programme_id', 'cohort_id', 'academic_session_id', 'letter_grade', 'issued_by', 'metadata', 'deleted_at']);
        });

        Schema::dropIfExists('course_grades');
        Schema::dropIfExists('gradebook_items');
        Schema::dropIfExists('attendance_records');
    }
};
