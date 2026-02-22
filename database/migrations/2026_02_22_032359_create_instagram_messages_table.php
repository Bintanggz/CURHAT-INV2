<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('instagram_messages', function (Blueprint $table) {
            $table->id();
            $table->string('instagram_id')->unique();
            $table->string('conversation_id');
            $table->text('message');
            $table->string('from_name');
            $table->string('from_id');
            $table->timestamp('timestamp')->nullable();
            
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('status_id')->default(1)->constrained('complaint_statuses');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instagram_messages');
    }
};
