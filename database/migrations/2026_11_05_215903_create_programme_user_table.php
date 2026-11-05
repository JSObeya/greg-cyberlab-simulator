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
        if (! Schema::hasTable('programme_user')) {
            Schema::create('programme_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('programme_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->dateTime('enrolled_at')->nullable()->useCurrent();
                $table->string('status')->default('active'); // active, completed, suspended, dropped
                $table->text('notes')->nullable();
                $table->unique(['programme_id', 'user_id']);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programme_user');
    }
};
