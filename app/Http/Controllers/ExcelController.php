<?php

namespace App\Http\Controllers;

use App\Models\Phrase;
use Illuminate\Http\Request;

use App\Http\Requests;
use Excel;

class ExcelController extends Controller
{
    static $fields = ['phrase', 'minus', 'original', 'frequency'];

    public function export(Request $request)
    {
        return Excel::create('wstat_' . date('Y-m-d_H-i-s'), function($excel) use ($request) {
            $excel->sheet(@$request->title, function($sheet) use ($request) {
                $data = [array_merge(['id'], self::$fields)];
                foreach($request->phrases as $index => $phrase) {
                    $array = [$index + 1];
                    foreach(self::$fields as $field) {
                        $array[] = @$phrase[$field];
                    }
                    $data[] = $array;
                }
                $sheet->fromArray($data, null, 'A1', true, false);
            });
        })->download('xls');
    }
}
