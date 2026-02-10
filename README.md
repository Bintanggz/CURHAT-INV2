# Sistem Aspirasi Masyarakat (Instagram Sync)

Sistem berbasis web yang dirancang untuk mengumpulkan, mengelola, dan menindaklanjuti aspirasi masyarakat yang masuk melalui komentar di akun Instagram resmi secara otomatis. 

## 🚀 Fitur Utama

- **Otomatisasi Sinkronisasi Instagram**: Menarik komentar terbaru dari postingan Instagram Business secara otomatis menggunakan Instagram Graph API.
- **Kategorisasi Otomatis (Keyword Matching)**: Mengelompokkan aspirasi ke dalam kategori (Infrastruktur, Kesehatan, Pendidikan, dll.) berdasarkan kata kunci dalam pesan.
- **Dashboard Admin Interaktif**: 
  - Monitoring semua aspirasi dalam satu tabel yang bersih.
  - Filter berdasarkan tanggal, kategori, dan status penanganan.
  - Update status penanganan (Baru, Diproses, Selesai) secara langsung.
- **Deep Link Instagram**: Tombol "Lihat" yang langsung mengarahkan dan menyorot (highlight) komentar spesifik di aplikasi Instagram.
- **Auto-Refresh**: Dashboard otomatis memperbarui data setiap 60 detik agar informasi tetap aktual.

## 🛠️ Teknologi yang Digunakan

- **Backend**: Laravel 12 (PHP)
- **Frontend**: React.js dengan Inertia.js
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **API**: Instagram Graph API Business

## 🔧 Persyaratan Sistem

- PHP >= 8.2
- Node.js & NPM
- Composer
- MySQL Database

## ⚙️ Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/username/CURHAT-INV.git
   cd CURHAT-INV
   ```

2. **Instal Dependensi PHP**:
   ```bash
   composer install
   ```

3. **Instal Dependensi Frontend**:
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**:
   Salin file `.env.example` menjadi `.env` dan sesuaikan pengaturan database serta kredensial Instagram.
   ```bash
   cp .env.example .env
   ```

5. **Generate App Key**:
   ```bash
   php artisan key:generate
   ```

6. **Migrasi Database**:
   ```bash
   php artisan migrate
   ```

7. **Jalankan Aplikasi**:
   Buka dua tab terminal:
   - Terminal 1: `php artisan serve`
   - Terminal 2: `npm run dev`

## 📸 Konfigurasi Instagram API

Untuk menggunakan fitur Sync, pastikan Anda telah mengisi variabel berikut di file `.env`:

```env
IG_ACCESS_TOKEN=your_token_here
IG_USER_ID=your_instagram_business_account_id
```

## ⏳ Scheduler (Otomatisasi)

Untuk menjalankan sinkronisasi otomatis tanpa perlu klik tombol manual, Anda bisa menggunakan Laravel Scheduler:

- **Lokal**: Jalankan `php artisan schedule:work`
- **Produksi**: Tambahkan satu baris Cron Job di server Anda:
  ```bash
  * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
  ```

## 📝 Lisensi

Proyek ini bersifat open-source di bawah lisensi [MIT](LICENSE).
