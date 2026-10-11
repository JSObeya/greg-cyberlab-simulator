<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('cohorts', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('laboratories', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('attempts', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('laboratories', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('cohorts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
