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
            'combination_fragment_min_values',
            static function (Blueprint $table) {
                $table->id();
                $table->foreignId('combination_id')->constrained()->onDelete('cascade');
                $table->foreignId('fragment_id')->constrained()->onDelete('cascade');
                $table->float('value');
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
        Schema::dropIfExists('combination_fragment_min_values');
    }
};
