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
            'metadata',
            static function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('display_name');
                $table->string('type');
                $table->json('capabilities');
                $table->json('values');
                $table->json('values_by_dataset');
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
        Schema::dropIfExists('metadata');
    }
};
