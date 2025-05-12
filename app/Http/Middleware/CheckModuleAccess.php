<?php

namespace App\Http\Middleware;

use App\Attributes\RoleAccess;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use ReflectionMethod;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $route = $request->route();
        $controllerAction = $route?->getAction('controller');

        if ($controllerAction && str_contains($controllerAction, '@')) {
            [$controllerClass, $method] = explode('@', $controllerAction);

            $reflection = new ReflectionMethod($controllerClass, $method);
            $attributes = $reflection->getAttributes(RoleAccess::class);
            foreach ($attributes as $attribute) {
                $roleAccess = $attribute->newInstance();
                $moduleName = $roleAccess->module;
                $requiredPermission = $roleAccess->permission;

                $user = Auth::user();

                $permissions = $user->modulePermissions()
                    ->with('module')
                    ->get()
                    ->filter(fn($perm) => $perm->module->name === $moduleName);

                $hasRequiredPermission = $permissions->pluck('name')->contains($requiredPermission);
                $hasViewPermission = $permissions->pluck('name')->contains('can_view');

                if (!$hasRequiredPermission && !$user->superstaff) {
                    // Try to find the module path (e.g. /users, /roles, etc.)
                    $modulePath = $permissions->first()?->module->path;

                    $action = str_replace('can_', '', $requiredPermission);

                    if ($hasViewPermission && $modulePath) {
                        return redirect($modulePath)->with('error', "Unauthorized to {$action}.");
                    }

                    return redirect('/dashboard')->with('error', "Unauthorized to {$action}.");
                }

                if (!Gate::allows('access-module', $moduleName)) {
                    return redirect('/dashboard')->with('error', 'Unauthorized to access module.');
                }
            }
        }

        return $next($request);
    }
}
