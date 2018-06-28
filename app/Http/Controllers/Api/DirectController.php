<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Service\YandexDirect;
use App\Service\WordStat;

class DirectController extends Controller
{
    public function getFrequencies(Request $request)
    {
        $data = YandexDirect::getFrequencies($request->phrases, $request->region_id);
        return response()->json($data)->setStatusCode(is_string($data) ? 422 : 200);
    }

    public function addFromWordstat(Request $request)
    {
        return WordStat::getData($request->keyphrase);
    }
}
