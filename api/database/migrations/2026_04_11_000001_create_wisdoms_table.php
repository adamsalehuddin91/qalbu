<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wisdoms', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->string('source');
            $table->string('category'); // Tawakal, Sabar, Rezeki, Syukur
            $table->string('language', 5)->default('ms'); // ms / ar / en
            $table->boolean('is_active')->default(true);
            $table->string('content_hash', 64)->unique(); // SHA256 — prevent duplicates
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wisdoms');
    }
};
