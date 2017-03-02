<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lists extends Model
{
    protected $fillable = [
        'title'
    ];

    public function phrases()
    {
        return $this->hasMany(Phrase::class);
    }

    public function getPhrasesCountAttribute()
    {
        return $this->phrases()->count();
    }
}
