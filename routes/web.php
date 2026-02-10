<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/admin/comments', function () { return Inertia::render('Admin/Comments'); })->middleware(['auth', 'verified'])->name('admin.comments');

// Rute untuk Data Fetching (Gunakan web guard agar session tetap aktif)
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/instagram/fetch', [\App\Http\Controllers\Api\InstagramController::class, 'fetch']);
    Route::get('/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
    Route::put('/comments/{id}', [\App\Http\Controllers\Api\CommentController::class, 'update']);
    Route::get('/categories', [\App\Http\Controllers\Api\CommentController::class, 'categories']);
    Route::get('/statuses', [\App\Http\Controllers\Api\CommentController::class, 'statuses']);
});
