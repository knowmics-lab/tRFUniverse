<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     * @throws \Throwable
     */
    public function run(): void
    {
        DB::transaction(
            function () {
                $this->call(
                    [
                        FragmentSeeder::class,
                        MetadataSeeder::class,
                        SampleSeeder::class,
                        CombinationSeeder::class,
                        GeneSeeder::class,
                        DatasetOptionsSeeder::class,
                        TargetSampleSeeder::class,
                    ]
                );
            }
        );
        $this->call(
            [
                TargetSeeder::class,
                TargetBindingSiteSeeder::class,
                TargetBindingSiteSourceSeeder::class,
                TargetExpressionSeeder::class,
            ]
        );
    }
}
