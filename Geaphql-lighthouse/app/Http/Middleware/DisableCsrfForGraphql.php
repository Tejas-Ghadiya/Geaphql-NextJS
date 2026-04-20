<?php

namespace App\Http\Middleware;

use Closure;

class DisableCsrfForGraphql
{
    public function handle($request, Closure $next)
    {
        // Disable CSRF for GraphQL endpoints
        if ($request->is('graphql') || $request->is('api/*')) {
            return $next($request);
        }
        
        return $next($request);
    }
}