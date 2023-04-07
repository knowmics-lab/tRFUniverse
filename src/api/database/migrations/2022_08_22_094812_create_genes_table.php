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
            'genes',
            static function (Blueprint $table) {
                $table->id();
                $table->string('gene_id')->index();
                $table->string('gene_name')->index();
                $table->string('gene_type');
                $table->string('dataset_type');
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
        Schema::dropIfExists('genes');
    }
};
