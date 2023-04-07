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
            'target_binding_sites',
            static function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->foreignId('target_id')->constrained();
                $table->string('transcript_id', 512);
                $table->string('transcript_name', 512);
                $table->string('position');
                $table->integer('start');
                $table->integer('end');
                $table->float('mfe');
                $table->integer('count');
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
        Schema::dropIfExists('target_binding_sites');
    }
};
