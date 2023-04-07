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
            'samples',
            static function (Blueprint $table) {
                $table->id();
                $table->string('sample_id')->index();
                $table->string('sex')->nullable();
                $table->float('age')->nullable();
                $table->string('dataset')->index();
                $table->string('dataset_name');
                $table->float('weight')->nullable();
                $table->string('sample_type')->nullable();
                $table->string('stage')->nullable();
                $table->string('grade')->nullable();
                $table->string('race')->nullable();
                $table->float('OS')->nullable();
                $table->string('OS_status')->nullable();
                $table->float('DFS')->nullable();
                $table->string('DFS_status')->nullable();
                $table->float('DSS')->nullable();
                $table->string('DSS_status')->nullable();
                $table->float('PFS')->nullable();
                $table->string('PFS_status')->nullable();
                $table->boolean('history_neoadjuvant_treatment')->nullable();
                $table->boolean('new_event_after_initial_treatment')->nullable();
                $table->boolean('radiation_therapy')->nullable();
                $table->string('cancer_status')->nullable();
                $table->float('MSI_score_MANTIS')->nullable();
                $table->float('MSI_sensor_score')->nullable();
                $table->float('aneuploidy_score')->nullable();
                $table->float('TMB')->nullable();
                $table->string('first_event')->nullable();
                $table->string('subtype_mRNA')->nullable();
                $table->string('subtype_DNA_methylation')->nullable();
                $table->string('subtype_protein')->nullable();
                $table->string('subtype_miRNA')->nullable();
                $table->string('subtype_CNA')->nullable();
                $table->string('subtype_integrative')->nullable();
                $table->string('subtype_other')->nullable();
                $table->string('subtype_selected')->nullable();
                $table->boolean('epithelial')->nullable();
                $table->string('histology')->nullable();
                $table->string('ploidy')->nullable();
                $table->string('p53_status')->nullable();
                $table->string('tissue')->nullable();
                $table->float('tumor_purity')->nullable();
                $table->string('platform')->nullable();
                $table->string('discretized_tumor_purity')->nullable();
                $table->string('discretized_ages')->nullable();
                $table->string('discretized_TMB_median')->nullable();
                $table->string('discretized_TMB_highest_quintile')->nullable();
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
        Schema::dropIfExists('samples');
    }
};
