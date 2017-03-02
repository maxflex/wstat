<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Models\Service\Translit;
use App\Http\Controllers\Controller;

class TranslitController extends Controller
{
    public function toUrl(Request $request)
    {
        return Translit::toUrl($request->text);
    }
}
