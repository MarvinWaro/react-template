<?php

use App\Http\Controllers\Client\Settings\ClientPasswordController;
use App\Http\Controllers\Client\Settings\ClientProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\EnsureUserIsActivated;

Route::middleware(['auth', EnsureUserIsActivated::class, 'client.flag'])->group(function () {
    Route::get('c/settings/profile', [ClientProfileController::class, 'edit'])->name('client.profile.edit');
    Route::get('c/settings/password', [ClientPasswordController::class, 'edit'])->name('client.password.edit');
    Route::get('c/settings/appearance', function () {
        return Inertia::render('client-side/settings/appearance');
    })->name('appearance');
});
