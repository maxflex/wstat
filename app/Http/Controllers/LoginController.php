<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use ReCaptcha\ReCaptcha;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        /**
         * Проверка капчи
         */
        $recaptcha = new ReCaptcha(config('captcha.secret'));
        $resp = $recaptcha->verify($request->captcha, @$_SERVER['HTTP_X_REAL_IP']);
        if (! $resp->isSuccess()) {
            User::log(null, 'failed_login', 'попытка обхода captcha');
            return $resp->getErrorCodes();
        }

        return response()->json(User::login($request));
    }

    public function logout()
    {
        User::logout();
        return redirect('/');
    }
}
