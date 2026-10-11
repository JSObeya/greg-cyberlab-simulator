<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laboratories', function (Blueprint $table) {
            $table->string('primary_workspace')->default('general_workbench')->after('status');
            $table->string('version')->default('1.0.0')->after('primary_workspace');
            $table->longText('theory_notes')->nullable()->after('scenario_background');
            $table->json('vocabulary')->nullable()->after('theory_notes');
            $table->json('safety_scope')->nullable()->after('safety_notice');
            $table->json('tasks')->nullable()->after('instructions');
            $table->json('evidence_requirements')->nullable()->after('tasks');
            $table->json('readiness_questions')->nullable()->after('evidence_requirements');
            $table->json('rubric')->nullable()->after('expected_findings');
            $table->longText('debrief_content')->nullable()->after('rubric');
            $table->json('prerequisites')->nullable()->after('debrief_content');
        });

        Schema::table('attempts', function (Blueprint $table) {
            $table->json('readiness_answers')->nullable()->after('penalties');
            $table->json('evidence_data')->nullable()->after('readiness_answers');
            $table->json('autosaved_state')->nullable()->after('evidence_data');
            $table->json('rubric_scores')->nullable()->after('autosaved_state');
            $table->timestamp('safety_acknowledged_at')->nullable()->after('rubric_scores');
            $table->string('policy_version')->nullable()->after('safety_acknowledged_at');
        });
    }

    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropColumn([
                'readiness_answers',
                'evidence_data',
                'autosaved_state',
                'rubric_scores',
                'safety_acknowledged_at',
                'policy_version',
            ]);
        });

        Schema::table('laboratories', function (Blueprint $table) {
            $table->dropColumn([
                'primary_workspace',
                'version',
                'theory_notes',
                'vocabulary',
                'safety_scope',
                'tasks',
                'evidence_requirements',
                'readiness_questions',
                'rubric',
                'debrief_content',
                'prerequisites',
            ]);
        });
    }
};
