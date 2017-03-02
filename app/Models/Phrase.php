<?php

namespace App\Models;

use App\Traits\Exportable;
use Illuminate\Database\Eloquent\Model;

class Phrase extends Model
{
    use Exportable;

    public $timestamps = false;

    protected static $hidden_on_export = [
        'list_id'
    ];
}
