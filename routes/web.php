<?php

use App\Http\Controllers\Client\ClientDashboardController;
use App\Http\Controllers\RoleManagement\RolesController;
use App\Http\Controllers\RoleManagement\ModulesController;
use App\Http\Controllers\User\ActivateController;
use App\Http\Controllers\RoleManagement\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\EnsureUserIsActivated;
use App\Http\Middleware\RedirectIfActivated;

// * if dealing with files, use post method even in updating.

Route::middleware(['auth', 'verified', RedirectIfActivated::class])->group(function () {
    Route::get('activate-account', [ActivateController::class, 'create'])
        ->name('activate-account');

    Route::post('activate-account', [ActivateController::class, 'store'])
        ->name('activate-account.store');
});

Route::middleware(['auth', 'verified', EnsureUserIsActivated::class, 'module.access'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'create'])
        ->name('dashboard');

    Route::get('users', [UserController::class, 'create'])
        ->name('users');

    Route::post('users/register-user', [UserController::class, 'createUser'])
        ->name('users.register-user');

    Route::get('users/view/{id}', [UserController::class, 'viewUser'])
        ->name('users.view-user');

    Route::delete('users/delete-user/{id}', [UserController::class, 'deleteUser'])
        ->name('users.delete-user');

    Route::post('users/update-user/{id}', [UserController::class, 'updateUser'])
        ->name('users.update-user');

    Route::get('roles', [RolesController::class, 'create'])
        ->name('roles');
    Route::delete('roles/delete-role/{id}', [RolesController::class, 'delete'])
        ->name('roles.delete-role');
    Route::get('roles/users', [RolesController::class, 'getRoleUsers'])
        ->name('roles.users');
    Route::delete('/roles/revoke/{id}', [RolesController::class, 'revokeUserRole'])->name('roles.revoke');
    Route::post('/roles/revoke/{id}', [RolesController::class, 'revertUserRole'])->name('roles.revert');
    Route::get('/roles/view/{id}', [RolesController::class, 'viewRolePermissions'])->name('roles.view');
    Route::post('/roles/update/permissions', [RolesController::class, 'manageRoleModulePermissions'])
        ->name('roles.update-permissions');
    Route::post('/roles/add-role', [RolesController::class, 'createRole'])
        ->name('roles.add-role');

    Route::get('modules', [ModulesController::class, 'create'])
        ->name('modules');

    Route::get('modules/view/{id}', [ModulesController::class, 'viewManageModule'])
        ->name('modules.view');

    Route::post('modules/update/permissions', [ModulesController::class, 'updateModulePermissions'])
        ->name('modules.update-permissions');

    Route::post('/modules/add-module', [ModulesController::class, 'createModule'])
        ->name('modules.add-module');

    Route::delete('modules/delete-module/{id}', [ModulesController::class, 'delete'])
        ->name('modules.delete-module');
});

require __DIR__ . '/client-web.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';