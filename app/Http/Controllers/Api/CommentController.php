<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstagramComment;
use App\Models\InstagramMessage;
use App\Models\Category;
use App\Models\ComplaintStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // 1. Ambil Komentar
        $commentQuery = InstagramComment::with(['category', 'status', 'post']);
        $this->applyFilters($commentQuery, $request);
        $comments = $commentQuery->get()->map(function($item) {
            $item->type = 'comment';
            return $item;
        });

        // 2. Ambil DM (Messages)
        $messageQuery = InstagramMessage::with(['category', 'status']);
        $this->applyFilters($messageQuery, $request);
        $messages = $messageQuery->get()->map(function($item) {
            $item->type = 'dm';
            return $item;
        });

        // 3. Gabungkan dan Urutkan
        $allAspirasi = $comments->concat($messages)
            ->sortByDesc('timestamp')
            ->values();

        return response()->json([
            'data' => $allAspirasi
        ]);
    }

    protected function applyFilters($query, Request $request)
    {
        // Filter by Date
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('timestamp', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        // Filter by Category
        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        // Filter by Status
        if ($request->has('status_id') && $request->status_id != '') {
            $query->where('status_id', $request->status_id);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'status_id' => 'required|exists:complaint_statuses,id',
            'type' => 'required|in:comment,dm'
        ]);

        if ($request->type === 'comment') {
            $item = InstagramComment::findOrFail($id);
        } else {
            $item = InstagramMessage::findOrFail($id);
        }

        $item->update([
            'category_id' => $request->category_id,
            'status_id' => $request->status_id,
        ]);

        return response()->json(['message' => 'Updated successfully', 'data' => $item]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::all());
    }

    public function statuses(): JsonResponse
    {
        return response()->json(ComplaintStatus::all());
    }
}
