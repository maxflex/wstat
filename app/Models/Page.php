<?php

namespace App\Models;

use App\Traits\Exportable;
use DB;
use Schema;
use Shared\Model;

class Page extends Model
{
   use Exportable;
   protected $commaSeparated = ['subjects'];
   protected $fillable = [
        'keyphrase',
        'url',
        'title',
        'keywords',
        'desc',
        'published',
        'h1',
        'h1_bottom',
        'html',
        'position',
        'sort',
        'place',
        'subjects',
        'station_id',
        'seo_desktop',
        'seo_mobile',
        'variable_id',
        'hidden_filter',
        'useful'
    ];

    protected static $hidden_on_export = [
        'id',
        'position',
        'created_at',
        'updated_at'
    ];

    protected static $selects_on_export = [
        'id',
        'keyphrase',
    ];

    protected static $long_fields = [
        'html'
    ];

    protected static $with_comma_on_export = [
        'tags'
    ];

    protected $attributes = [
        'seo_desktop' => 0,
        'seo_mobile' => 0,
        'sort' => 1,
    ];

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function useful()
    {
        return $this->hasMany(PageUseful::class);
    }

    public function setUsefulAttribute($value)
    {
        $this->useful()->delete();
        foreach($value as $v) {
            if ($v['page_id_field']) {
                $this->useful()->create($v);
            }
        }
    }

    public function setVariableIdAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['variable_id'] = null;
        } else {
            $this->attributes['variable_id'] = $value;
        }
    }

    public static function search($search)
    {
        $query = static::query();

        if (!empty($search->tags)) {
            foreach(Tag::getIds($search->tags) as $tag_id) {
                $query->whereHas('tags', function($query) use ($tag_id) {
                    $query->whereId($tag_id);
                });
            }
        }

        return $query;
    }
}
