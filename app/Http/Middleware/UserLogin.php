<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use App\Service\SessionService;

class UserLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (! User::loggedIn()) {
            return redirect(config('sso.server') . '?url=' . url()->current());
        }
        SessionService::action();
        view()->share('user', User::fromSession());
        return $next($request);
    }
}
