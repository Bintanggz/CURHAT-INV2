<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\InstagramPost;
use App\Models\InstagramMessage;
use App\Models\InstagramComment;
use App\Models\Category;
use Carbon\Carbon;

class InstagramService
{
    protected $baseUrl = 'https://graph.facebook.com/v19.0';
    protected $accessToken;
    protected $userId;

    public function __construct()
    {
        $this->accessToken = config('services.instagram.access_token');
        $this->userId = config('services.instagram.user_id');
    }

    public function syncData()
    {
        if (!$this->accessToken || !$this->userId) {
            $msg = 'Kredensial Instagram tidak ditemukan di .env (IG_ACCESS_TOKEN atau IG_USER_ID)';
            Log::error($msg);
            return ['status' => 'error', 'message' => $msg];
        }

        try {
            // 0. Validasi Token & User ID
            $testResponse = Http::get("{$this->baseUrl}/{$this->userId}", [
                'fields' => 'name,username',
                'access_token' => $this->accessToken
            ]);
            
            if ($testResponse->failed()) {
                Log::error("Instagram Token Validation Failed: " . $testResponse->body());
                return ['status' => 'error', 'message' => 'Token Instagram tidak valid atau tidak memiliki akses ke User ID ini.'];
            }
            Log::info("Instagram Token Validated for User: " . $testResponse->json()['username']);

            // 1. Ambil Postingan & Komentar
            $posts = $this->fetchPosts();
            $newCommentsCount = 0;

            foreach ($posts as $postData) {
                $post = InstagramPost::updateOrCreate(
                    ['instagram_id' => $postData['id']],
                    [
                        'caption' => $postData['caption'] ?? null,
                        'permalink' => $postData['permalink'] ?? null,
                        'media_url' => $postData['media_url'] ?? null,
                        'timestamp' => isset($postData['timestamp']) ? Carbon::parse($postData['timestamp']) : null,
                    ]
                );

                $comments = $this->fetchComments($post->instagram_id);

                foreach ($comments as $commentData) {
                    $exists = InstagramComment::where('instagram_id', $commentData['id'])->exists();
                    
                    if (!$exists) {
                        InstagramComment::create([
                            'instagram_id' => $commentData['id'],
                            'instagram_post_id' => $post->id,
                            'message' => $commentData['text'] ?? '',
                            'from_name' => $commentData['from']['name'] ?? 'Anonymous',
                            'from_id' => $commentData['from']['id'] ?? '0',
                            'timestamp' => isset($commentData['timestamp']) ? Carbon::parse($commentData['timestamp']) : now(),
                            'category_id' => $this->determineCategory($commentData['text'] ?? ''),
                            'status_id' => 1,
                        ]);
                        $newCommentsCount++;
                    }
                }
            }

            // 2. Ambil Direct Messages (DM)
            $newMessagesCount = $this->syncMessages();

            return [
                'status' => 'success', 
                'new_comments' => $newCommentsCount,
                'new_messages' => $newMessagesCount
            ];

        } catch (\Exception $e) {
            Log::error('Instagram Sync Error: ' . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function syncMessages()
    {
        Log::info("Instagram DM Sync Started for User: {$this->userId}");
        $conversations = $this->fetchConversations();
        Log::info("Found " . count($conversations) . " conversations.");
        
        $newMessagesCount = 0;

        foreach ($conversations as $conv) {
            Log::info("Fetching messages for conversation: {$conv['id']}");
            $messages = $this->fetchMessages($conv['id']);
            Log::info("Found " . count($messages) . " messages in conversation {$conv['id']}.");

            foreach ($messages as $msgData) {
                // Cek apakah pesan sudah ada
                $exists = InstagramMessage::where('instagram_id', $msgData['id'])->exists();
                
                // Hanya simpan jika belum ada DAN pesan bukan dari user kita sendiri (admin)
                $isFromAdmin = isset($msgData['from']['id']) && (string)$msgData['from']['id'] === (string)$this->userId;
                
                Log::info("Processing Message: {$msgData['id']}", [
                    'message' => $msgData['message'] ?? '',
                    'exists' => $exists,
                    'isFromAdmin' => $isFromAdmin,
                    'from_id' => $msgData['from']['id'] ?? 'unknown'
                ]);

                if (!$exists && !$isFromAdmin) {
                    InstagramMessage::create([
                        'instagram_id' => $msgData['id'],
                        'conversation_id' => $conv['id'],
                        'message' => $msgData['message'] ?? '',
                        'from_name' => $msgData['from']['username'] ?? $msgData['from']['name'] ?? 'Anonymous',
                        'from_id' => $msgData['from']['id'] ?? '0',
                        'timestamp' => isset($msgData['created_time']) ? Carbon::parse($msgData['created_time']) : now(),
                        'category_id' => $this->determineCategory($msgData['message'] ?? ''),
                        'status_id' => 1,
                    ]);
                    $newMessagesCount++;
                }
            }
        }

        return $newMessagesCount;
    }

    protected function fetchConversations()
    {
        $response = Http::get("{$this->baseUrl}/{$this->userId}/conversations", [
            'platform' => 'instagram',
            'access_token' => $this->accessToken,
        ]);

        if ($response->failed()) {
            Log::error("Failed to fetch conversations: " . $response->body());
            return [];
        }

        return $response->json()['data'] ?? [];
    }

    protected function fetchMessages($conversationId)
    {
        $response = Http::get("{$this->baseUrl}/{$conversationId}/messages", [
            'fields' => 'id,created_time,from,message',
            'access_token' => $this->accessToken,
        ]);

        if ($response->failed()) {
            Log::warning("Failed to fetch messages for conversation {$conversationId}: " . $response->body());
            return [];
        }

        return $response->json()['data'] ?? [];
    }

    protected function determineCategory($text)
    {
        $text = strtolower($text);
        
        // Pemetaan Kata Kunci ke ID Kategori
        $keywords = [
            1 => ['jalan', 'jembatan', 'rusak', 'aspal', 'lubang', 'infrastruktur', 'penerangan', 'lampu'], // Infrastruktur
            2 => ['puskesmas', 'sakit', 'obat', 'kesehatan', 'periksa', 'dokter', 'perawat', 'layanan kesehatan'], // Kesehatan
            3 => ['sekolah', 'guru', 'beasiswa', 'didik', 'pendidikan', 'pelajar', 'siswa'], // Pendidikan
            4 => ['sampah', 'kotor', 'bau', 'bersih', 'selokan', 'got', 'limbah'], // Kebersihan
            5 => ['pelayanan', 'kantor', 'surat', 'izin', 'layanan publik', 'disdukcapil', 'kecamatan'], // Layanan Publik
        ];

        foreach ($keywords as $categoryId => $words) {
            foreach ($words as $word) {
                if (str_contains($text, $word)) {
                    return $categoryId;
                }
            }
        }

        return 6; // Default: Lainnya
    }

    protected function fetchPosts()
    {
        // Fields: id, caption, media_type, media_url, permalink, timestamp
        $response = Http::get("{$this->baseUrl}/{$this->userId}/media", [
            'fields' => 'id,caption,media_type,media_url,permalink,timestamp',
            'access_token' => $this->accessToken,
            'limit' => 20 // Bisa disesuaikan
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to fetch posts: ' . $response->body());
        }

        return $response->json()['data'] ?? [];
    }

    protected function fetchComments($mediaId)
    {
        // Fields: id, text, timestamp, from
        $response = Http::get("{$this->baseUrl}/{$mediaId}/comments", [
            'fields' => 'id,text,timestamp,from,username',
            'access_token' => $this->accessToken,
            'limit' => 50
        ]);

        if ($response->failed()) {
            // Bisa jadi tidak ada komentar atau error lain, log warning saja
            Log::warning("Failed to fetch comments for post {$mediaId}: " . $response->body());
            return [];
        }

        return $response->json()['data'] ?? [];
    }
}
