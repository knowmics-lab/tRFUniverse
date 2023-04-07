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
            'target_samples',
            static function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->string('dataset')->index();
                $table->string('sample')->index();
                $table->string('type')->index();
                $table->string('cell_line')->index();
                $table->string('ago')->index();
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
        Schema::dropIfExists('target_samples');
    }
};
