<?php

namespace App\Models\Service;
use DB;

class Factory
{
    public static function get($table, $select = null, $orderBy = null)
    {
        $query = DB::connection('factory')->table($table);

        if ($select) {
            $query->select('id', $select);
        }

        if ($orderBy) {
            if (is_array($orderBy)) {
                list($field, $type) = $orderBy;
                $query->orderBy($field, $type);
            } else {
                $query->orderBy($orderBy);
            }
        }

        return $query->get();
    }

    public static function json($table, $select = null, $orderBy = null)
    {
        $data = static::get($table, $select, $orderBy);
        return json_encode($data);
    }
}
