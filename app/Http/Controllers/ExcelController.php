<?php

namespace App\Http\Controllers;

use App\Models\Phrase;
use Illuminate\Http\Request;

use App\Http\Requests;

class ExcelController extends Controller
{
    public function export($lists_id)
    {
        return Phrase::export($lists_id);
    }

    public function import(Request $request, $lists_id = false)
    {
        return Phrase::import($request, $lists_id);
    }
}
