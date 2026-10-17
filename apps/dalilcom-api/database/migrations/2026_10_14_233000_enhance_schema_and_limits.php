<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ads')) {
            Schema::table('ads', function (Blueprint $table) {
                if (!Schema::hasColumn('ads', 'map_url')) {
                    $table->text('map_url')->nullable()->after('whatsapp_phone');
                }
                if (!Schema::hasColumn('ads', 'latitude')) {
                    $table->decimal('latitude', 10, 7)->nullable()->after('map_url');
                }
                if (!Schema::hasColumn('ads', 'longitude')) {
                    $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
                }
            });
        }

        if (Schema::hasTable('default_limits')) {
            Schema::table('default_limits', function (Blueprint $table) {
                if (!Schema::hasColumn('default_limits', 'max_ads')) {
                    $table->integer('max_ads')->default(5);
                }
            });

            DB::table('default_limits')->updateOrInsert(
                ['id' => 1],
                ['max_ads' => 5, 'max_images' => 5, 'max_videos' => 1]
            );
        }

        if (Schema::hasTable('user_limits')) {
            Schema::table('user_limits', function (Blueprint $table) {
                if (!Schema::hasColumn('user_limits', 'max_ads')) {
                    $table->integer('max_ads')->default(5);
                }
            });
        }

        if (Schema::hasTable('app_settings')) {
            $defaults = [
                'cars_enabled' => 'true',
                'admin_username' => 'admin',
                'admin_password_hash' => password_hash('admin123', PASSWORD_BCRYPT),
            ];
            foreach ($defaults as $key => $val) {
                if (!DB::table('app_settings')->where('setting_key', $key)->exists()) {
                    DB::table('app_settings')->insert([
                        'setting_key' => $key,
                        'setting_value' => $val,
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Backfill real_estate_specs category_id and subcategory_id from ads.subcategory / property_type
        if (Schema::hasTable('real_estate_specs') && Schema::hasTable('real_estate_subcategories')) {
            $reAds = DB::table('ads')
                ->join('real_estate_specs', 'ads.id', '=', 'real_estate_specs.ad_id')
                ->select('ads.id', 'ads.subcategory', 'real_estate_specs.property_type', 'real_estate_specs.category_id', 'real_estate_specs.subcategory_id')
                ->get();

            foreach ($reAds as $reAd) {
                $catId = $reAd->category_id;
                $subId = $reAd->subcategory_id;

                if (!$subId && !empty($reAd->subcategory)) {
                    $subRow = DB::table('real_estate_subcategories')
                        ->where('ar_name', $reAd->subcategory)
                        ->first();
                    if ($subRow) {
                        $subId = $subRow->id;
                        $catId = $catId ?: $subRow->category_id;
                    }
                }

                if (!$catId && !empty($reAd->property_type)) {
                    $catRow = DB::table('real_estate_categories')
                        ->where('ar_name', 'like', '%' . $reAd->property_type . '%')
                        ->orWhere('id', $reAd->property_type)
                        ->first();
                    if ($catRow) {
                        $catId = $catRow->id;
                    }
                }

                if (!$catId) {
                    $catId = DB::table('real_estate_categories')->where('id', 'apartments')->value('id')
                        ?? DB::table('real_estate_categories')->value('id');
                }

                if ($catId || $subId) {
                    DB::table('real_estate_specs')
                        ->where('ad_id', $reAd->id)
                        ->update([
                            'category_id' => $catId,
                            'subcategory_id' => $subId,
                        ]);
                }
            }
        }

        // Synchronize PostgreSQL sequences for auto-incrementing tables
        if (DB::getDriverName() === 'pgsql') {
            $seqTables = [
                'countries',
                'users',
                'car_brands',
                'car_models',
                'real_estate_subcategories',
                'ad_images',
                'ad_videos',
                'ad_details',
                'comparisons',
            ];
            foreach ($seqTables as $tbl) {
                if (Schema::hasTable($tbl)) {
                    DB::statement("SELECT setval(pg_get_serial_sequence('{$tbl}', 'id'), COALESCE((SELECT MAX(id) FROM {$tbl}), 0) + 1, false)");
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ads')) {
            Schema::table('ads', function (Blueprint $table) {
                $cols = array_filter(['map_url', 'latitude', 'longitude'], fn ($c) => Schema::hasColumn('ads', $c));
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
        if (Schema::hasTable('default_limits') && Schema::hasColumn('default_limits', 'max_ads')) {
            Schema::table('default_limits', function (Blueprint $table) {
                $table->dropColumn('max_ads');
            });
        }
        if (Schema::hasTable('user_limits') && Schema::hasColumn('user_limits', 'max_ads')) {
            Schema::table('user_limits', function (Blueprint $table) {
                $table->dropColumn('max_ads');
            });
        }
    }
};
