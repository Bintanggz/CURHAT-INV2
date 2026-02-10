<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\ComplaintStatus;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Status Aduan
        $statuses = ['BARU', 'DIPROSES', 'SELESAI'];
        foreach ($statuses as $status) {
            ComplaintStatus::firstOrCreate(['name' => $status]);
        }

        // Kategori Aduan
        $categories = ['Infrastruktur', 'Kesehatan', 'Pendidikan', 'Kebersihan', 'Layanan Publik', 'Lainnya'];
        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category]);
        }
    }
}
