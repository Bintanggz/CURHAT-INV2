<?php

use App\Http\Controllers\Api\InstagramController;
use App\Http\Controllers\Api\CommentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Bisa dihapus 'auth:sanctum' jika ingin public akses sementara atau gunakan session auth via Sanctum default Breeze
});

// Menggunakan middleware 'web' atau 'api'. Jika diakses dari React dalam satu domain (stateful), sanctum otomatis handle session.
// Rute API telah dipindahkan ke routes/web.php untuk menggunakan session authentication.
