<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Service\YandexDirect;

class FunctionsController extends Controller
{
    public function getFrequencies(Request $request)
    {
        return YandexDirect::getFrequencies($request->phrases);
    }
}
