<?php

namespace App\Http\Controllers;

use App\Services\WisdomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WisdomController extends Controller
{
    public function __construct(private WisdomService $wisdomService) {}

    // GET /api/v1/wisdom/random
    // GET /api/v1/wisdom/random?category=Sabar
    public function random(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $wisdom = $this->wisdomService->getRandom($category);

        if (!$wisdom) {
            return response()->json(['message' => 'No wisdom found.'], 404);
        }

        return response()->json([
            'data' => [
                'id'          => $wisdom->id,
                'content'     => $wisdom->content,
                'arabic_text' => $wisdom->arabic_text,
                'meaning'     => $wisdom->meaning,
                'lesson'      => $wisdom->lesson,
                'source'      => $wisdom->source,
                'category'    => $wisdom->category,
                'language'    => $wisdom->language,
                'tags'        => $wisdom->tags,
            ],
        ]);
    }

    // POST /api/v1/wisdom/ingest  (protected by VerifyN8NToken)
    public function ingest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content'     => 'required|string',
            'arabic_text' => 'sometimes|nullable|string',
            'meaning'     => 'sometimes|nullable|string',
            'lesson'      => 'sometimes|nullable|string',
            'source'      => 'required|string|max:255',
            'category'    => 'required|in:Tawakal,Sabar,Rezeki,Syukur',
            'language'    => 'sometimes|in:ms,ar,en',
            'tags'        => 'sometimes|array',
        ]);

        $result = $this->wisdomService->ingest($validated);

        if ($result['status'] === 'duplicate') {
            return response()->json(['message' => 'Duplicate content — skipped.'], 409);
        }

        return response()->json(['message' => 'Wisdom ingested.', 'data' => $result['wisdom']], 201);
    }
}
