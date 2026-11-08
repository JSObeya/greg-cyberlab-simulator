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
        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'course_id')) {
                $table->unsignedBigInteger('course_id')->nullable()->change();
            }
            if (! Schema::hasColumn('quizzes', 'cohort_id')) {
                $table->foreignId('cohort_id')->nullable()->after('course_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('quizzes', 'programme_id')) {
                $table->foreignId('programme_id')->nullable()->after('cohort_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('quizzes', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (! Schema::hasColumn('quizzes', 'category')) {
                $table->string('category')->default('cybersecurity')->after('description');
            }
            if (! Schema::hasColumn('quizzes', 'exam_type')) {
                $table->string('exam_type')->default('mcq')->after('category');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'cohort_id')) {
                $table->dropForeign(['cohort_id']);
                $table->dropColumn('cohort_id');
            }
            if (Schema::hasColumn('quizzes', 'programme_id')) {
                $table->dropForeign(['programme_id']);
                $table->dropColumn('programme_id');
            }
            if (Schema::hasColumn('quizzes', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('quizzes', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('quizzes', 'exam_type')) {
                $table->dropColumn('exam_type');
            }
        });
    }
};
