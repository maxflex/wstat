<?php

namespace App\Traits;

use App\Models\Phrase;
use Schema;
use Excel;


/**
 *
 * using Exportable trait obliges defining $selects_on_export field in classes.
 *
*/
trait Exportable
{
    public static function getExportableFields()
    {
        return array_values(
                    array_diff(
                        collect(Schema::getColumnListing((new static)->getTable()))->all(),
                        isset(static::$hidden_on_export) ? static::$hidden_on_export : []
                    )
               );
    }

    /**
     * Экспорт данных в excel файл
     *
     */
    public static function export($lists_id) {
        $table_name = (new static)->getTable();
        return Excel::create($table_name . '_' . date('Y-m-d_H-i-s'), function($excel) use ($table_name, $lists_id) {
            $excel->sheet($table_name, function($sheet) use ($lists_id) {
                $query = static::query()->where('lists_id', $lists_id);
                $data = $query->select(static::getExportableFields())->get();
                $exportData = [];

                $data->map(function ($item, $key) use (&$exportData) {
                    $exportData[$key] = $item->toArray();
                });

                $sheet->fromArray($exportData, null, 'A1', true);
            });
        })->download('xls');
    }

    /**
     * Импорт данных из excel файла
     *
     */
    public static function import($request, $lists_id) {
        if ($request->hasFile('imported_file')) {
            $data = [];
            Excel::load($request->file('imported_file'), function ($reader) use (&$data, $lists_id) {
                $data = $reader->all()->toArray();
                // если уже существующий список, то обновляем данные.
//                if ($lists_id) {
//                    foreach ($data as $item) {
//                        static::updateOrCreate($item);
//                    }
//                }
            });
            return $data;
        } else {
            abort(400);
        }
    }
}