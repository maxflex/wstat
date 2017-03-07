<?php

namespace App\Models;

use App\Traits\Exportable;
use Shared\Model;

class Phrase extends Model
{
    use Exportable;

    public $timestamps = false;

    protected $fillable = [
        'phrase',
        'frequency',
        'original',
        'minus'
    ];

    protected static function boot()
    {
        static::creating(function($model) {
            if ($model->attributes && ! isset($model->attributes['original'])) {
                $model->attributes['original'] = $model->phrase;
            }
        });
    }
}
