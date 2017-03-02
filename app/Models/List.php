<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class List extends Model
{
    protected $fillable = [
        'title',
        'phrases'
    ];

    public function phrases()
    {
        return $this->hasMany(Phrase::class);
    }

    public function setPhrasesAttribute()
    {
        $this->phrases()->delete();
        foreach($this->attributes['phrases'] as $phrase) {

        }
    }
}
