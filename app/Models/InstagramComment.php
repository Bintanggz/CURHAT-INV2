<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InstagramComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'instagram_id',
        'instagram_post_id',
        'message',
        'from_name',
        'from_id',
        'timestamp',
        'category_id',
        'status_id',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function post()
    {
        return $this->belongsTo(InstagramPost::class, 'instagram_post_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function status()
    {
        return $this->belongsTo(ComplaintStatus::class, 'status_id');
    }
}
