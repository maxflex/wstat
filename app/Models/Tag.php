<?php

namespace App\Models;

use App\Traits\Exportable;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use Exportable;

    protected static $hidden_on_export = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected static $selects_on_export = [
        'id',
    ];

    protected $fillable = ['text'];

    public static function getIds($tags)
    {
        return collect($tags)->pluck('id')->all();
    }
}
