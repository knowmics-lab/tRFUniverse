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
            'targets',
            static function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->foreignId('fragment_id')->constrained();
                $table->string('gene_id');
                $table->string('gene_name');
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
        Schema::dropIfExists('targets');
    }
};
