<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstagramComment;
use App\Models\Category;
use App\Models\ComplaintStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InstagramComment::with(['category', 'status', 'post']);

        // Filter by Date
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('timestamp', [$request->start_date, $request->end_date]);
        }

        // Filter by Category
        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        // Filter by Status
        if ($request->has('status_id') && $request->status_id != '') {
            $query->where('status_id', $request->status_id);
        }

        $comments = $query->orderBy('timestamp', 'desc')->paginate(10);

        return response()->json($comments);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'status_id' => 'required|exists:complaint_statuses,id',
        ]);

        $comment = InstagramComment::findOrFail($id);
        $comment->update([
            'category_id' => $request->category_id,
            'status_id' => $request->status_id,
        ]);

        return response()->json(['message' => 'Comment updated successfully', 'data' => $comment]);
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
