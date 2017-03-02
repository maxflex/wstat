<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Tag;

class PagesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $search = isset($_COOKIE['pages']) ? json_decode($_COOKIE['pages']) : (object)[];
        $query = Page::search($search);
        if ($request->sort) {
            $query->orderBy('updated_at', 'desc');
        } else {
            $query->orderBy('keyphrase');
        }
        return $query->paginate(30);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $page = Page::create($request->input())->fresh();
        if (isset($request->tags)) {
            $page->tags()->sync(Tag::getIds($request->tags));
        }
        return $page;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Page::with(['tags', 'useful'])->find($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id§
     * @return \Illumi§nate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $page = Page::find($id);
        if (isset($request->tags)) {
            $page->tags()->sync(Tag::getIds($request->tags));
        }
        $page->update($request->input());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Page::destroy($id);
    }

    /**
     * Check page existance
     */
     public function checkExistance(Request $request, $id = null)
     {
         $query = Page::query();

         if ($id !== null) {
             $query->where('id', '!=', $id);
         }

         return ['exists' => $query->where($request->field, $request->value)->exists()];
     }
}
