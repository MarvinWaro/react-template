<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class AuthServiceprovider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Gate::define('access-module', function ($user, $moduleName) {
            if ($user->superstaff) {
                return true;
            }

            return DB::table('module_permissions')
                ->join('modules', 'module_permissions.module_id', '=', 'modules.id')
                ->join('roles', 'module_permissions.role_id', '=', 'roles.id')
                ->join('role_user', 'role_user.role_id', '=', 'roles.id')
                ->where('module_permissions.name', 'can_view')
                ->where('modules.name', $moduleName)
                ->where('role_user.user_id', $user->id)
                ->whereNull('module_permissions.deleted_at')
                ->whereNull('modules.deleted_at')
                ->whereNull('roles.deleted_at')
                ->whereNull('role_user.deleted_at')
                ->exists();
        });
    }
}
