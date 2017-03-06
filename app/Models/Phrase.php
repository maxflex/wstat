<?php

namespace App\Models;

use App\Traits\Exportable;
use Illuminate\Database\Eloquent\Model;

class Phrase extends Model
{
    use Exportable;

    public $timestamps = false;
    protected $fillable = [
        'phrase',
        'frequency',
        'original'
    ];

    protected static function boot()
    {
        static::creating(function($model) {
            $model->attributes['original'] = $model->phrase;
        });
    }
}
