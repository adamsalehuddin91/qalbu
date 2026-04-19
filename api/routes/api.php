<?php

use App\Http\Controllers\WisdomController;
use App\Http\Middleware\VerifyN8NToken;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::prefix('v1')->group(function () {
    // Public
    Route::get('/wisdom/random', [WisdomController::class, 'random']);

    // n8n ingest — protected
    Route::post('/wisdom/ingest', [WisdomController::class, 'ingest'])
        ->middleware([VerifyN8NToken::class, 'throttle:60,1']);
});
