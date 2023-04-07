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
            'fragment_positions',
            static function (Blueprint $table) {
                $table->id();
                $table->foreignId('fragment_id')->constrained()->onDelete('cascade');
                $table->string('chromosome')->index();
                $table->integer('start');
                $table->integer('end');
                $table->string('strand');
                $table->string('aminoacid')->index();
                $table->string('anticodon')->index();
                $table->index(['chromosome', 'start', 'end', 'strand']);
                $table->index(['start', 'end']);
                $table->index(['end', 'start']);
                $table->timestamps();
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
        Schema::dropIfExists('fragment_positions');
    }
};
