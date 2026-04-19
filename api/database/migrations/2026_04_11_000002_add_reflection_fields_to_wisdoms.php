<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wisdoms', function (Blueprint $table) {
            $table->text('arabic_text')->nullable()->after('content'); // ayat/hadith dalam Arabic
            $table->text('meaning')->nullable()->after('arabic_text');  // maksud dalam BM
            $table->text('lesson')->nullable()->after('meaning');       // pengajaran / refleksi
        });
    }

    public function down(): void
    {
        Schema::table('wisdoms', function (Blueprint $table) {
            $table->dropColumn(['arabic_text', 'meaning', 'lesson']);
        });
    }
};
