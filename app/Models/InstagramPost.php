<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InstagramPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'instagram_id',
        'caption',
        'permalink',
        'media_url',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function comments()
    {
        return $this->hasMany(InstagramComment::class);
    }
}
