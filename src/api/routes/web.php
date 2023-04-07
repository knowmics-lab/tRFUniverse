<?php

use App\Http\Controllers\IndexController;
use App\Http\Controllers\MorpheusController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', IndexController::class);

Route::get('/morpheus/{dataKey}', MorpheusController::class)->name('morpheus');

Route::any('/storage/{path}', static function (string $path) {
    if (str_contains($path, '..')) {
        abort(403);
    }
    $path = storage_path('app/public/' . $path);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
})->where('path', '.*');

require __DIR__.'/auth.php';
