<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InstagramService;
use Illuminate\Http\JsonResponse;

class InstagramController extends Controller
{
    protected $instagramService;

    public function __construct(InstagramService $instagramService)
    {
        $this->instagramService = $instagramService;
    }

    public function fetch(): JsonResponse
    {
        $result = $this->instagramService->syncData();
        return response()->json($result);
    }
}
