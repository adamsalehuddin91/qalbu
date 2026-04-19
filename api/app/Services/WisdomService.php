<?php

namespace App\Services;

use App\Models\Wisdom;
use Illuminate\Support\Facades\Cache;

class WisdomService
{
    public function getRandom(?string $category = null): ?Wisdom
    {
        $cacheKey = 'wisdom_' . session()->getId() . ($category ? "_$category" : '');

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($category) {
            $query = Wisdom::where('is_active', true);

            if ($category) {
                $query->where('category', $category);
            }

            return $query->inRandomOrder()->first();
        });
    }

    public function ingest(array $data): array
    {
        $hash = hash('sha256', $data['content']);

        if (Wisdom::where('content_hash', $hash)->exists()) {
            return ['status' => 'duplicate'];
        }

        $wisdom = Wisdom::create([
            'content'      => $data['content'],
            'arabic_text'  => $data['arabic_text'] ?? null,
            'meaning'      => $data['meaning'] ?? null,
            'lesson'       => $data['lesson'] ?? null,
            'source'       => $data['source'],
            'category'     => $data['category'],
            'language'     => $data['language'] ?? 'ms',
            'is_active'    => true,
            'content_hash' => $hash,
            'tags'         => $data['tags'] ?? null,
        ]);

        return ['status' => 'created', 'wisdom' => $wisdom];
    }
}
