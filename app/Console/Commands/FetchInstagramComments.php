<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\InstagramService;

class FetchInstagramComments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'instagram:fetch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch latest posts and comments from Instagram Business API';

    /**
     * Execute the console command.
     */
    public function handle(InstagramService $service)
    {
        $this->info('Starting Instagram Fetch...');
        
        $result = $service->syncData();

        if ($result['status'] === 'success') {
            $this->info("Success!");
            $this->info("New comments synced: " . ($result['new_comments'] ?? 0));
            $this->info("New messages synced: " . ($result['new_messages'] ?? 0));
        } else {
            $this->error("Error: " . $result['message']);
        }
    }
}
