<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetClientFlag
{
    public function handle(Request $request, Closure $next)
    {
        $request->attributes->set('isClientRoute', true);

        return $next($request);
    }
}