<?php

use App\Http\Controllers\Client\ClientDashboardController;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureUserIsActivated;

Route::middleware(['auth', 'verified', EnsureUserIsActivated::class, 'module.access', 'client.flag'])->group(function () {
    Route::get('/', [ClientDashboardController::class, 'create'])->name('home');
});

require __DIR__ . '/client-settings.php';