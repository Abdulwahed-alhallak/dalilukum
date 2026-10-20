<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_update_logs', function (Blueprint $table) {
            $table->id();
            $table->string('platform', 20);
            $table->integer('version');
            $table->string('device_id', 120)->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // Default app update settings
        DB::table('app_settings')->updateOrInsert(
            ['setting_key' => 'app_version'],
            ['setting_value' => '18', 'updated_at' => now()]
        );
        DB::table('app_settings')->updateOrInsert(
            ['setting_key' => 'app_force_update'],
            ['setting_value' => '0', 'updated_at' => now()]
        );
        DB::table('app_settings')->updateOrInsert(
            ['setting_key' => 'app_download_url'],
            ['setting_value' => 'https://dalilukum.sy/dalilukum-latest.apk', 'updated_at' => now()]
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('app_update_logs');
    }
};
