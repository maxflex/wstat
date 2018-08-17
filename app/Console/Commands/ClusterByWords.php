<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ClusterByWords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cluster:by_words';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $headers = ['фраза', 'клики', 'показы', 'рубли', 'конверсии'];
        $file = file('report.tsv', FILE_IGNORE_NEW_LINES);
        $data = [];
        $this->info("Reading file...");
        foreach($file as $line) {
            $line = trim($line);
            if ($line) {
                // $data[] = explode("\t", $line);
                @list($phrase, $shows, $clicks, $rubbles, $conversions) = explode("\t", $line);
                $phrase = trim($phrase);
                $rubbles = floatval(str_replace(",", ".", $rubbles));
                $data[] = (object)compact('phrase', 'shows', 'clicks', 'rubbles', 'conversions');
                // $data[] = [$phrase, $shows, $clicks, $rubbles, $conversions];
                // $this->info(json_encode([$phrase, $shows, $clicks, $rubbles, $conversions]));
            }
        }


        $this->info("Creating report...");
        $bar = $this->output->createProgressBar(count($data));
        $result = [];
        foreach($data as $d) {
            foreach(explode(' ', $d->phrase) as $word) {
                if (! isset($result[$word])) {
                    foreach($data as $i => $d2) {
                        try {
                            if (preg_match("/\b" . $word . "\b/u", $d2->phrase)) {
                                if (! isset($result[$word])) {
                                    $result[$word] = [
                                        'shows'       => 0,
                                        'clicks'      => 0,
                                        'rubbles'     => 0.0,
                                        'conversions' => 0
                                    ];
                                }
                                // $this->info(implode("\t", [$d2->shows, $d2->clicks, $d2->rubbles, $d2->conversions]));
                                $result[$word]['shows'] += intval($d2->shows);
                                $result[$word]['clicks'] += intval($d2->clicks);
                                $result[$word]['rubbles'] += $d2->rubbles;
                                if ($d2->conversions) {
                                    $result[$word]['conversions'] += intval($d2->conversions);
                                }
                            }
                        } catch (\Exception $e) {
                            $this->error("");
                            $this->error("Error: " . $e->getMessage());
                            $this->error("Word: " . $word);
                            $this->error("Phrase #{$i}: " . json_encode($d2));
                            return;
                        }
                    }
                    if (isset($result[$word])) {
                        $table_data[] = [$word, $result[$word]['shows'], $result[$word]['clicks'], $result[$word]['rubbles'], $result[$word]['conversions']];
                    }
                }
            }
            $bar->advance();
        }
        $bar->finish();

        file_put_contents("result.tsv", implode("\t", ['слово', 'показы', 'клики', 'рубли', 'конверсии', PHP_EOL]));
        foreach($table_data as $line) {
            file_put_contents('result.tsv',  implode("\t", $line). PHP_EOL , FILE_APPEND | LOCK_EX);
        }

        // $this->table($headers, $table_data);
    }
}
