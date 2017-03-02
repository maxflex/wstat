<?php

namespace App\Traits;

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
                    array_merge(
                        array_diff(
                            collect(Schema::getColumnListing((new static)->getTable()))->all(),
                            isset(static::$hidden_on_export) ? static::$hidden_on_export : []
                        ),
                        isset(static::$with_comma_on_export) ? static::$with_comma_on_export : []
                    )
        );
    }

    /**
     * Экспорт данных в excel файл
     *
     */
    public static function export() {
        $table_name = (new static)->getTable();
        return Excel::create($table_name . '_' . date('Y-m-d_H-i-s'), function($excel) use ($table_name) {
            $excel->sheet($table_name, function($sheet) {
                $query = static::query();
                // если экспортируем HTML, то только длина символов
                if (isset(static::$with_comma_on_export)) {
                    $query->with(static::$with_comma_on_export);
                }

                $data = $query->select(static::getExportableFields())->get();
                $exportData = [];

                $data->map(function ($item, $key) use (&$exportData) {
                    if (isset(static::$with_comma_on_export)) {
                        foreach (static::$with_comma_on_export as $field) {
                            $item->$field = count($ids = $item->$field->pluck('id')) ? implode(',', $ids->all()) : '';
                            unset($item->relations[$field]);
                        }
                    }

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
    public static function import($request) {
        if ($request->hasFile('imported_file')) {
            Excel::load($request->file('imported_file'), function($reader){
                foreach ($reader->all()->toArray() as $model) {
                    if (isset(static::$long_fields)) {
                        foreach (static::$long_fields as $field) {
                            unset($model[$field]);
                        }
                    }

                    if (isset(static::$with_comma_on_export) && $elem = static::find($model['id'])) {
                        foreach (static::$with_comma_on_export as $field) {
                            if (array_key_exists($field, $model)) {
                                $model[$field] && $elem->$field()->sync(explode(',', str_replace('.', ',', $model[$field]))); // 5,6 => 5.6 fix
                                unset($model[$field]);
                            }
                        }
                    }

                    static::whereId($model['id'])->update($model);
                }
            });
        } else {
            abort(400);
        }
    }
}