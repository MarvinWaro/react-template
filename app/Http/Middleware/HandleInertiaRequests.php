<?php

namespace App\Http\Middleware;

use App\Models\Module;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()->with('roles')->first();

        $permissions = $user?->modulePermissions()
            ->with('module')
            ->get()
            ->groupBy(fn($perm) => $perm->module->name)
            ->map(fn($items) => $items->pluck('name')->values())
            ->toArray();

        $rawModules = Module::with('children')
            ->whereNull('parent_id')
            ->where('is_client', $request->attributes->get('isClientRoute', false))
            ->orderBy('order')
            ->get();

        $modules = $rawModules->groupBy('group_title');

        return [
            ...parent::share($request),
            'appCompany' => config('app.company'),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user,
                'is_admin' => $user?->hasAdminRole(),
                'permissions' => $permissions,
                'is_super_admin' => $user?->isSuperStaff(),
            ],
            'navigations' => $modules,
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'isClientRoute' => fn() => $request->attributes->get('isClientRoute', false),
        ];
    }
}
