<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Service\YandexDirect;

class GetFrequencies implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $phrases;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(array $phrases = [])
    {
        $this->phrases = $phrases;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        YandexDirect::getFrequencies($this->phrases);
    }
}
