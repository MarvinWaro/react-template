<?php

namespace App\Http\Middleware;

use App\Attributes\RoleAccess;
use Closure;
use Illuminate\Http\Request;
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
                $moduleName = $roleAccess->moduleName;

                if (!Gate::allows('access-module', $moduleName)) {
                    return redirect('/dashboard')->with('error', 'Unauthorized to access module.');
                }
            }
        }

        return $next($request);
    }
}
