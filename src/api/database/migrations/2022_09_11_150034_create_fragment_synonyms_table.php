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
            'fragment_synonyms',
            static function (Blueprint $table) {
                $table->id();
                $table->foreignId('fragment_id')->constrained()->onDelete('cascade');
                $table->string('synonym')->index();
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
        Schema::dropIfExists('fragment_synonyms');
    }
};
