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
            'combinations',
            static function (Blueprint $table) {
                $table->id();
                $table->string('dataset')->index();
                $table->string('sample_type')->nullable()->index();
                $table->string('sex')->nullable()->index();
                $table->string('race')->nullable()->index();
                $table->string('subtype_selected')->nullable()->index();
                $table->string('discretized_ages')->nullable()->index();
                $table->string('tissue')->nullable()->index();
                $table->string('epithelial')->nullable()->index();
                $table->string('ploidy')->nullable()->index();
                $table->string('p53_status')->nullable()->index();
                $table->string('histology')->nullable()->index();
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
        Schema::dropIfExists('combinations');
    }
};
