<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyN8NToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-N8N-TOKEN');

        if (!$token || $token !== config('services.n8n.token')) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
