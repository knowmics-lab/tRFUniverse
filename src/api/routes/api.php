<?php

use App\Http\Controllers\AminoacidController;
use App\Http\Controllers\Analysis\ClusterAnalysisController;
use App\Http\Controllers\Analysis\Correlation\CorrelatedEnrichmentAnalysisController;
use App\Http\Controllers\Analysis\Correlation\CorrelationPlotController;
use App\Http\Controllers\Analysis\Correlation\MediatedCorrelationPlotController;
use App\Http\Controllers\Analysis\Correlation\MostCorrelatedTableController;
use App\Http\Controllers\Analysis\Correlation\MostMediatedCorrelatedTableController;
use App\Http\Controllers\Analysis\Differential\DifferentialExpressionAnalysisController;
use App\Http\Controllers\Analysis\Differential\DifferentialExpressionAnalysisMetadataController;
use App\Http\Controllers\Analysis\Differential\DifferentialSurvivalAnalysisController;
use App\Http\Controllers\Analysis\DimensionalityReductionAnalysisController;
use App\Http\Controllers\Analysis\PHENSIM\PHENSIMAnalysisController;
use App\Http\Controllers\Analysis\PHENSIM\PHENSIMCallbackController;
use App\Http\Controllers\Analysis\ShowAnalysisResultsController;
use App\Http\Controllers\Analysis\ShowAnalysisStatusController;
use App\Http\Controllers\Analysis\SurvivalAnalysisController;
use App\Http\Controllers\Analysis\TargetsEnrichmentAnalysisController;
use App\Http\Controllers\AnticodonController;
use App\Http\Controllers\ChromosomeController;
use App\Http\Controllers\FragmentController;
use App\Http\Controllers\Fragments\ExpressionPlotController;
use App\Http\Controllers\Fragments\FragmentIdentifierController;
use App\Http\Controllers\Fragments\SearchByNameController;
use App\Http\Controllers\Fragments\SearchController;
use App\Http\Controllers\Fragments\SurvivalPlotController;
use App\Http\Controllers\FragmentTypeController;
use App\Http\Controllers\GeneController;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\MetadataController;
use App\Http\Controllers\TargetController;
use App\Http\Controllers\Targets\TargetIdentifierController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get(
    '/user',
    function (Request $request) {
        return $request->user();
    }
);

Route::group(
    ['prefix' => 'v1', 'as' => 'api.'],
    static function () {
        Route::get('/', IndexController::class);
        Route::get('/fragments/ids', FragmentIdentifierController::class);
        Route::post('/fragments/search/name', SearchByNameController::class);
        Route::post('/fragments/search', SearchController::class);
        Route::post('/fragments/{fragment}/enrichment', TargetsEnrichmentAnalysisController::class);
        Route::post('/fragments/{fragment}/phensim', PHENSIMAnalysisController::class);
        Route::post('/fragments/{fragment}/expression_graph', ExpressionPlotController::class);
        Route::post('/fragments/{fragment}/survival', SurvivalPlotController::class);
        Route::get('/fragments/{fragment}/targets', [TargetController::class, 'index']);
        Route::resource('fragments', FragmentController::class)->only(['index', 'show']);

        Route::group(
            ['prefix' => 'analysis', 'as' => 'analysis.'],
            static function () {
                Route::post('/survival', SurvivalAnalysisController::class);
                Route::post('/differential_survival', DifferentialSurvivalAnalysisController::class);
                Route::post(
                    '/differentially_expressed/metadata',
                    DifferentialExpressionAnalysisMetadataController::class
                );
                Route::post('/differentially_expressed', DifferentialExpressionAnalysisController::class);
                Route::post('/dimensionality_reduction', DimensionalityReductionAnalysisController::class);
                Route::post('/clustering', ClusterAnalysisController::class);
                Route::group(
                    ['prefix' => 'correlation', 'as' => 'correlation.'],
                    static function () {
                        Route::post('/plot', CorrelationPlotController::class);
                        Route::post('/plot/mediated', MediatedCorrelationPlotController::class);
                        Route::post('/table', MostCorrelatedTableController::class);
                        Route::post('/table/mediated', MostMediatedCorrelatedTableController::class);
                        Route::post('/enrichment', CorrelatedEnrichmentAnalysisController::class);
                    }
                );
                Route::get('/{analysisId}', ShowAnalysisStatusController::class);
                Route::get('/{analysisId}/results', ShowAnalysisResultsController::class);
            }
        );

        Route::get('/targets/ids', TargetIdentifierController::class);
        Route::resource('targets', TargetController::class)->only(['index', 'show']);
        Route::get('/aminoacids', AminoacidController::class);
        Route::get('/anticodons', AnticodonController::class);
        Route::get('/chromosomes', ChromosomeController::class);
        Route::get('/fragment-types', FragmentTypeController::class);
        Route::get('/metadata', MetadataController::class);
        Route::post('/genes/search', [GeneController::class, 'search']);
        Route::get('/genes', [GeneController::class, 'index']);
        Route::any('/phensim/{analysisId}', PHENSIMCallbackController::class)
             ->name('phensim.callback')
             ->where('analysisId', '[A-Za-z0-9\-]+');
    }
);
