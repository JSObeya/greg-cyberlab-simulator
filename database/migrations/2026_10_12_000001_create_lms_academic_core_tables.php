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
        // 1. Academic Sessions (e.g. 2026/2027 Academic Session, Batch A)
        if (! Schema::hasTable('academic_sessions')) {
            Schema::create('academic_sessions', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // e.g. "2026/2027 Academic Year"
                $table->string('code')->unique(); // e.g. "AY-2026-27"
                $table->date('start_date');
                $table->date('end_date');
                $table->boolean('is_current')->default(false);
                $table->text('description')->nullable();
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 2. Enhance Programmes with rich academic fields
        Schema::table('programmes', function (Blueprint $table) {
            if (! Schema::hasColumn('programmes', 'code')) {
                $table->string('code', 50)->nullable()->after('slug');
            }
            if (! Schema::hasColumn('programmes', 'department')) {
                $table->string('department')->default('Cybersecurity Operations')->after('code');
            }
            if (! Schema::hasColumn('programmes', 'duration')) {
                $table->string('duration')->default('3 Months')->after('department');
            }
            if (! Schema::hasColumn('programmes', 'delivery_mode')) {
                $table->string('delivery_mode')->default('hybrid')->after('duration');
            }
            if (! Schema::hasColumn('programmes', 'entry_requirements')) {
                $table->text('entry_requirements')->nullable()->after('delivery_mode');
            }
            if (! Schema::hasColumn('programmes', 'objectives')) {
                $table->text('objectives')->nullable()->after('entry_requirements');
            }
            if (! Schema::hasColumn('programmes', 'coordinator_id')) {
                $table->foreignId('coordinator_id')->nullable()->after('objectives')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('programmes', 'status')) {
                $table->string('status')->default('active')->after('coordinator_id');
            }
            if (! Schema::hasColumn('programmes', 'deleted_at')) {
                $table->softDeletes()->after('is_active');
            }
        });

        // 3. Enhance Courses with academic and publication review workflow
        Schema::table('courses', function (Blueprint $table) {
            if (! Schema::hasColumn('courses', 'code')) {
                $table->string('code', 50)->nullable()->after('slug');
            }
            if (! Schema::hasColumn('courses', 'summary')) {
                $table->text('summary')->nullable()->after('code');
            }
            if (! Schema::hasColumn('courses', 'credit_hours')) {
                $table->integer('credit_hours')->default(3)->after('level');
            }
            if (! Schema::hasColumn('courses', 'estimated_duration_hours')) {
                $table->integer('estimated_duration_hours')->default(40)->after('credit_hours');
            }
            if (! Schema::hasColumn('courses', 'passing_score')) {
                $table->integer('passing_score')->default(70)->after('estimated_duration_hours');
            }
            if (! Schema::hasColumn('courses', 'status')) {
                $table->string('status')->default('published')->after('passing_score');
            }
            if (! Schema::hasColumn('courses', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('courses', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('courses', 'published_at')) {
                $table->dateTime('published_at')->nullable()->after('approved_by');
            }
        });

        // 4. Enhance Cohorts with session, capacity, and coordinator fields
        Schema::table('cohorts', function (Blueprint $table) {
            if (! Schema::hasColumn('cohorts', 'programme_id')) {
                $table->foreignId('programme_id')->nullable()->after('course_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('cohorts', 'academic_session_id')) {
                $table->foreignId('academic_session_id')->nullable()->after('programme_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('cohorts', 'max_capacity')) {
                $table->integer('max_capacity')->default(30)->after('end_date');
            }
            if (! Schema::hasColumn('cohorts', 'status')) {
                $table->string('status')->default('active')->after('max_capacity');
            }
        });

        // 5. Course Instructors Pivot (Assigned Instructors per Course)
        if (! Schema::hasTable('course_instructors')) {
            Schema::create('course_instructors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->boolean('is_primary')->default(false);
                $table->dateTime('assigned_at')->useCurrent();
                $table->unique(['course_id', 'user_id']);
                $table->timestamps();
            });
        }

        // 6. Cohort Instructors Pivot (Assigned Instructors per Cohort)
        if (! Schema::hasTable('cohort_instructors')) {
            Schema::create('cohort_instructors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cohort_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->boolean('is_primary')->default(false);
                $table->dateTime('assigned_at')->useCurrent();
                $table->unique(['cohort_id', 'user_id']);
                $table->timestamps();
            });
        }

        // 7. Enhance Enrolment Pivot (cohort_user) with tracking status & dates
        Schema::table('cohort_user', function (Blueprint $table) {
            if (! Schema::hasColumn('cohort_user', 'status')) {
                $table->string('status')->default('active')->after('enrolled_at');
            }
            if (! Schema::hasColumn('cohort_user', 'completed_at')) {
                $table->dateTime('completed_at')->nullable()->after('status');
            }
            if (! Schema::hasColumn('cohort_user', 'notes')) {
                $table->text('notes')->nullable()->after('completed_at');
            }
        });
    }

    /**
     * Reverse the migrations safely.
     */
    public function down(): void
    {
        Schema::table('cohort_user', function (Blueprint $table) {
            $table->dropColumn(['status', 'completed_at', 'notes']);
        });

        Schema::dropIfExists('cohort_instructors');
        Schema::dropIfExists('course_instructors');

        Schema::table('cohorts', function (Blueprint $table) {
            $table->dropForeign(['programme_id']);
            $table->dropForeign(['academic_session_id']);
            $table->dropColumn(['programme_id', 'academic_session_id', 'max_capacity', 'status']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'code',
                'summary',
                'credit_hours',
                'estimated_duration_hours',
                'passing_score',
                'status',
                'created_by',
                'approved_by',
                'published_at',
            ]);
        });

        Schema::table('programmes', function (Blueprint $table) {
            $table->dropForeign(['coordinator_id']);
            $table->dropColumn([
                'code',
                'department',
                'duration',
                'delivery_mode',
                'entry_requirements',
                'objectives',
                'coordinator_id',
                'status',
                'deleted_at',
            ]);
        });

        Schema::dropIfExists('academic_sessions');
    }
};
