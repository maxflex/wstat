<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        return response()->json(User::login($request));
    }

    public function logout()
    {
        User::logout(); 
        return redirect('/');
    }
}
