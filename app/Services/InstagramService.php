<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\InstagramPost;
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
            // 1. Ambil Postingan
            $posts = $this->fetchPosts();
            $newCommentsCount = 0;

            foreach ($posts as $postData) {
                // Simpan/Update Post
                $post = InstagramPost::updateOrCreate(
                    ['instagram_id' => $postData['id']],
                    [
                        'caption' => $postData['caption'] ?? null,
                        'permalink' => $postData['permalink'] ?? null,
                        'media_url' => $postData['media_url'] ?? null,
                        'timestamp' => isset($postData['timestamp']) ? Carbon::parse($postData['timestamp']) : null,
                    ]
                );

                // 2. Ambil Komentar untuk Post ini
                $comments = $this->fetchComments($post->instagram_id);

                foreach ($comments as $commentData) {
                    // Cek duplikasi
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
                            'status_id' => 1, // Default BARU
                        ]);
                        $newCommentsCount++;
                    }
                }
            }

            return ['status' => 'success', 'new_comments' => $newCommentsCount];

        } catch (\Exception $e) {
            Log::error('Instagram Sync Error: ' . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
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
