<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instagram_comments', function (Blueprint $table) {
            $table->id();
            $table->string('instagram_id')->unique();
            $table->foreignId('instagram_post_id')->constrained('instagram_posts')->onDelete('cascade');
            $table->text('message');
            $table->string('from_name');
            $table->string('from_id');
            $table->timestamp('timestamp')->nullable();
            
            // Relasi ke kategori & status
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('status_id')->default(1)->constrained('complaint_statuses'); // Default 1 (BARU)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instagram_comments');
    }
};
