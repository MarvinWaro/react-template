<?php

namespace App\Http\Middleware;

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
        $allModules = DB::table('modules')->pluck('name')->toArray();

        $accessibleModules = [];
    
        foreach ($allModules as $module) {
            if (Gate::forUser($request->user())->allows('access-module', $module)) {
                $accessibleModules[] = $module;
            }
        }

        return [
            ...parent::share($request),
            'appCompany' => config('app.company'),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'is_admin' => $request->user()?->hasAdminRole(),
                'modules' => $accessibleModules,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success'=> fn () => $request->session()->get('success'),
            ],
            'isClientRoute' => fn () => $request->attributes->get('isClientRoute', false),
        ];
    }
}
