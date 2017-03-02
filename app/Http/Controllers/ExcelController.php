<?php

namespace App\Http\Controllers;

use App\Models\Phrase;
use Illuminate\Http\Request;

use App\Http\Requests;

class ExcelController extends Controller
{
    public function export()
    {
        return Phrase::export();
    }

    public function import(Request $request)
    {
        return Phrase::import($request);
    }
}
