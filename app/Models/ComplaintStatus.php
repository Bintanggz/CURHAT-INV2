<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComplaintStatus extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function comments()
    {
        return $this->hasMany(InstagramComment::class, 'status_id');
    }
}
