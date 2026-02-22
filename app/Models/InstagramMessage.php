<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InstagramMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'instagram_id',
        'conversation_id',
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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function status()
    {
        return $this->belongsTo(ComplaintStatus::class, 'status_id');
    }
}
