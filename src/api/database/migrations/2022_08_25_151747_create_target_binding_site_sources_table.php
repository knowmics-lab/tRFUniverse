<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create(
            'target_binding_site_sources',
            static function (Blueprint $table) {
                $table->id();
                $table->foreignId('target_binding_site_id')->constrained();
                $table->foreignId('sample_id')->constrained('target_samples');
                $table->string('algorithm');
                $table->string('target_sequence');
                $table->string('fragment_sequence');
                $table->float('mfe');
            }
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('target_binding_site_sources');
    }
};
