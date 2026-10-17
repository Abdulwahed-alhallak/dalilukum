<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SystemController extends Controller
{
    public function health()
    {
        DB::select('SELECT 1');
        return response()->json(['success' => true, 'data' => ['api' => true, 'database' => true]]);
    }

    public function stats()
    {
        $tables = [
            'ads',
            'users',
            'car_brands',
            'car_models',
            'real_estate_categories',
            'real_estate_subcategories',
            'notifications',
            'valuation_reports',
        ];
        $data = collect($tables)
            ->filter(fn ($t) => Schema::hasTable($t))
            ->map(fn ($table) => ['name' => $table, 'count' => DB::table($table)->count()])
            ->values();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function userLogin(Request $request)
    {
        $phone = trim((string) $request->input('phone', ''));
        abort_if($phone === '', 422, 'Phone number is required');

        $countryId = $request->input('country_id');
        if ($countryId && !is_numeric($countryId)) {
            $countryId = DB::table('countries')->where('phone_code', (string) $countryId)->value('id');
        }
        if (!$countryId && $request->filled('phone_code')) {
            $countryId = DB::table('countries')->where('phone_code', $request->input('phone_code'))->value('id');
        }
        if (!$countryId) {
            $countryId = DB::table('countries')->where('phone_code', '+963')->value('id')
                ?? DB::table('countries')->orderBy('id')->value('id');
        }

        $existing = DB::table('users')->where('phone', $phone)->first();
        if ($existing) {
            DB::table('users')->where('id', $existing->id)->update([
                'country_id' => $countryId ?: $existing->country_id,
                'updated_at' => now(),
            ]);
            $user = DB::table('users')->where('id', $existing->id)->first();
        } else {
            $id = DB::table('users')->insertGetId([
                'phone' => $phone,
                'country_id' => $countryId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $user = DB::table('users')->where('id', $id)->first();
        }

        $defaultLimits = Schema::hasTable('default_limits')
            ? DB::table('default_limits')->first()
            : null;
        $userLimits = (Schema::hasTable('user_limits') && $user)
            ? DB::table('user_limits')->where('user_id', $user->id)->first()
            : null;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'phone' => $user->phone,
                'country_id' => $user->country_id,
                'is_active' => (bool) $user->is_active,
                'limits' => [
                    'max_ads' => (int) ($userLimits->max_ads ?? $defaultLimits->max_ads ?? 5),
                    'max_images' => (int) ($userLimits->max_images ?? $defaultLimits->max_images ?? 5),
                    'max_videos' => (int) ($userLimits->max_videos ?? $defaultLimits->max_videos ?? 1),
                ],
            ],
        ]);
    }

    public function adminLogin(Request $request)
    {
        $username = trim((string) $request->input('username', ''));
        $password = (string) $request->input('password', '');

        $storedUser = DB::table('app_settings')->where('setting_key', 'admin_username')->value('setting_value') ?: 'admin';
        $storedHash = DB::table('app_settings')->where('setting_key', 'admin_password_hash')->value('setting_value');

        $validPassword = $storedHash
            ? password_verify($password, $storedHash)
            : ($password === 'admin123');

        if ($username !== $storedUser || !$validPassword) {
            return response()->json([
                'success' => false,
                'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'authenticated' => true,
                'username' => $storedUser,
            ],
        ]);
    }

    public function updateAdminCredentials(Request $request)
    {
        $newUsername = trim((string) $request->input('username', ''));
        $newPassword = (string) $request->input('password', '');
        abort_if($newUsername === '' || strlen($newPassword) < 4, 422, 'يرجى إدخال اسم مستخدم وكلمة مرور صالحة');

        DB::table('app_settings')->updateOrInsert(
            ['setting_key' => 'admin_username'],
            ['setting_value' => $newUsername, 'updated_at' => now()]
        );
        DB::table('app_settings')->updateOrInsert(
            ['setting_key' => 'admin_password_hash'],
            ['setting_value' => password_hash($newPassword, PASSWORD_BCRYPT), 'updated_at' => now()]
        );

        return response()->json([
            'success' => true,
            'data' => ['username' => $newUsername],
        ]);
    }

    public function syncCarModels(Request $request)
    {
        $brandId = $request->integer('brand_id');
        if (!$brandId && $request->filled('brand_name')) {
            $brandName = trim((string) $request->input('brand_name'));
            $brandId = (int) DB::table('car_brands')
                ->where('ar_name', $brandName)
                ->orWhere('en_name', $brandName)
                ->value('id');
        }
        abort_if(!$brandId, 422, 'Brand not found');

        $models = $request->input('models', []);
        DB::transaction(function () use ($brandId, $models) {
            $keptIds = [];
            foreach ($models as $m) {
                $arName = trim((string) ($m['ar_name'] ?? $m['name'] ?? ''));
                $enName = trim((string) ($m['en_name'] ?? $m['enName'] ?? $arName));
                if ($arName === '') {
                    continue;
                }
                $existing = DB::table('car_models')
                    ->where('brand_id', $brandId)
                    ->where(function ($q) use ($arName, $enName) {
                        $q->where('ar_name', $arName)->orWhere('en_name', $enName);
                    })
                    ->first();

                if ($existing) {
                    DB::table('car_models')->where('id', $existing->id)->update([
                        'ar_name' => $arName,
                        'en_name' => $enName,
                    ]);
                    $keptIds[] = $existing->id;
                } else {
                    $newId = DB::table('car_models')->insertGetId([
                        'brand_id' => $brandId,
                        'ar_name' => $arName,
                        'en_name' => $enName,
                        'ads_count' => (int) ($m['ads_count'] ?? $m['count'] ?? 0),
                    ]);
                    $keptIds[] = $newId;
                }
            }

            $deleteQuery = DB::table('car_models')->where('brand_id', $brandId);
            if (!empty($keptIds)) {
                $deleteQuery->whereNotIn('id', $keptIds);
            }
            $deleteQuery->delete();
        });

        $updated = DB::table('car_models')->where('brand_id', $brandId)->get();
        return response()->json(['success' => true, 'data' => $updated]);
    }

    public function syncRealEstateSubcategories(Request $request)
    {
        $categoryId = trim((string) $request->input('category_id', ''));
        abort_if($categoryId === '', 422, 'category_id is required');

        $subs = $request->input('subcategories', []);
        DB::transaction(function () use ($categoryId, $subs) {
            $keptIds = [];
            foreach ($subs as $s) {
                $arName = trim((string) ($s['ar_name'] ?? $s['name'] ?? ''));
                $enName = trim((string) ($s['en_name'] ?? $s['enName'] ?? $arName));
                $imageUrl = $s['image_url'] ?? $s['image'] ?? null;
                if ($arName === '') {
                    continue;
                }

                $existing = DB::table('real_estate_subcategories')
                    ->where('category_id', $categoryId)
                    ->where('ar_name', $arName)
                    ->first();

                if ($existing) {
                    DB::table('real_estate_subcategories')->where('id', $existing->id)->update([
                        'ar_name' => $arName,
                        'en_name' => $enName,
                        'image_url' => $imageUrl ?? $existing->image_url,
                    ]);
                    $keptIds[] = $existing->id;
                } else {
                    $newId = DB::table('real_estate_subcategories')->insertGetId([
                        'category_id' => $categoryId,
                        'ar_name' => $arName,
                        'en_name' => $enName,
                        'ads_count' => (int) ($s['ads_count'] ?? $s['count'] ?? 0),
                        'image_url' => $imageUrl,
                    ]);
                    $keptIds[] = $newId;
                }
            }

            $deleteQuery = DB::table('real_estate_subcategories')->where('category_id', $categoryId);
            if (!empty($keptIds)) {
                $deleteQuery->whereNotIn('id', $keptIds);
            }
            $deleteQuery->delete();
        });

        $updated = DB::table('real_estate_subcategories')->where('category_id', $categoryId)->get();
        return response()->json(['success' => true, 'data' => $updated]);
    }

    private function resolveUserId(Request $request): ?int
    {
        if ($request->filled('user_id') && is_numeric($request->input('user_id'))) {
            $uid = (int) $request->input('user_id');
            if (DB::table('users')->where('id', $uid)->exists()) {
                return $uid;
            }
        }
        if ($request->filled('phone')) {
            $phone = trim((string) $request->input('phone'));
            $existing = DB::table('users')->where('phone', $phone)->value('id');
            if ($existing) {
                return (int) $existing;
            }
            $countryId = DB::table('countries')->where('phone_code', '+963')->value('id')
                ?? DB::table('countries')->orderBy('id')->value('id');
            return (int) DB::table('users')->insertGetId([
                'phone' => $phone,
                'country_id' => $countryId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        return null;
    }

    public function userComparisons(Request $request)
    {
        if (!Schema::hasTable('comparisons') || !Schema::hasTable('comparison_items')) {
            return response()->json(['success' => true, 'data' => []]);
        }
        $userId = $this->resolveUserId($request);
        if (!$userId) {
            return response()->json(['success' => true, 'data' => []]);
        }
        $compId = DB::table('comparisons')->where('user_id', $userId)->orderByDesc('id')->value('id');
        if (!$compId) {
            return response()->json(['success' => true, 'data' => []]);
        }
        $adIds = DB::table('comparison_items')
            ->where('comparison_id', $compId)
            ->orderBy('sort_order')
            ->pluck('ad_id')
            ->values()
            ->all();

        return response()->json(['success' => true, 'data' => $adIds]);
    }

    public function toggleUserComparison(Request $request)
    {
        if (!Schema::hasTable('comparisons') || !Schema::hasTable('comparison_items')) {
            return response()->json(['success' => true, 'data' => []]);
        }
        $userId = $this->resolveUserId($request);
        abort_if(!$userId, 422, 'User identity required');

        $compId = DB::table('comparisons')->where('user_id', $userId)->orderByDesc('id')->value('id');
        if (!$compId) {
            $compId = DB::table('comparisons')->insertGetId([
                'user_id' => $userId,
                'created_at' => now(),
            ]);
        }

        if ($request->boolean('clear')) {
            DB::table('comparison_items')->where('comparison_id', $compId)->delete();
            return response()->json(['success' => true, 'data' => []]);
        }

        $adId = trim((string) $request->input('ad_id', ''));
        abort_if($adId === '', 422, 'ad_id is required');

        $exists = DB::table('comparison_items')
            ->where('comparison_id', $compId)
            ->where('ad_id', $adId)
            ->exists();

        if ($exists) {
            DB::table('comparison_items')
                ->where('comparison_id', $compId)
                ->where('ad_id', $adId)
                ->delete();
        } else {
            if (DB::table('ads')->where('id', $adId)->exists()) {
                $count = DB::table('comparison_items')->where('comparison_id', $compId)->count();
                if ($count < 4) {
                    DB::table('comparison_items')->insert([
                        'comparison_id' => $compId,
                        'ad_id' => $adId,
                        'sort_order' => $count,
                    ]);
                }
            }
        }

        $adIds = DB::table('comparison_items')
            ->where('comparison_id', $compId)
            ->orderBy('sort_order')
            ->pluck('ad_id')
            ->values()
            ->all();

        return response()->json(['success' => true, 'data' => $adIds]);
    }

    public function getNotificationPreferences(Request $request)
    {
        $defaults = [
            'notify_all_new' => true,
            'notify_category' => 'all',
            'notify_sound' => true,
        ];
        if (!Schema::hasTable('notification_preferences')) {
            return response()->json(['success' => true, 'data' => $defaults]);
        }
        $userId = $this->resolveUserId($request);
        if (!$userId) {
            return response()->json(['success' => true, 'data' => $defaults]);
        }
        $row = DB::table('notification_preferences')->where('user_id', $userId)->first();
        if (!$row) {
            return response()->json(['success' => true, 'data' => $defaults]);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => (int) $row->user_id,
                'notify_all_new' => (bool) $row->notify_all_new,
                'notify_category' => (string) $row->notify_category,
                'notify_sound' => (bool) $row->notify_sound,
            ],
        ]);
    }

    public function saveNotificationPreferences(Request $request)
    {
        abort_if(!Schema::hasTable('notification_preferences'), 422, 'Table not available');
        $userId = $this->resolveUserId($request);
        abort_if(!$userId, 422, 'يرجى تسجيل الدخول لحفظ تفضيلات الإشعارات');

        $category = (string) $request->input('notify_category', 'all');
        if (!in_array($category, ['all', 'cars', 'real-estate'], true)) {
            $category = 'all';
        }
        $values = [
            'notify_all_new' => $request->boolean('notify_all_new', true),
            'notify_category' => $category,
            'notify_sound' => $request->boolean('notify_sound', true),
        ];

        DB::table('notification_preferences')->updateOrInsert(
            ['user_id' => $userId],
            $values
        );

        return response()->json([
            'success' => true,
            'data' => array_merge(['user_id' => $userId], $values),
        ]);
    }

    public function markAllNotificationsRead(Request $request)
    {
        if (!Schema::hasTable('notifications')) {
            return response()->json(['success' => true, 'data' => ['updated' => 0]]);
        }
        $query = DB::table('notifications');
        $userId = $this->resolveUserId($request);
        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)->orWhereNull('user_id');
            });
        }
        $updated = $query->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => ['updated' => $updated],
        ]);
    }

    public function bootstrap(Request $request)
    {
        $adsResponse = app(AdController::class)->index(new Request(['per_page' => 250]))->getData(true);
        $ads = $adsResponse['data']['data'] ?? $adsResponse['data'] ?? [];

        $carBrands = app(CrudController::class, [
            'config' => ['table' => 'car_brands', 'key' => 'id', 'order' => 'id:asc'],
        ])->index(new Request(['per_page' => 500]))->getData(true)['data']['data'] ?? [];

        $carModels = app(CrudController::class, [
            'config' => ['table' => 'car_models', 'key' => 'id', 'order' => 'id:asc'],
        ])->index(new Request(['per_page' => 1000]))->getData(true)['data']['data'] ?? [];

        $reCategories = app(CrudController::class, [
            'config' => ['table' => 'real_estate_categories', 'key' => 'id', 'incrementing' => false, 'order' => 'id:asc'],
        ])->index(new Request(['per_page' => 200]))->getData(true)['data']['data'] ?? [];

        $reSubcategories = app(CrudController::class, [
            'config' => ['table' => 'real_estate_subcategories', 'key' => 'id', 'order' => 'id:asc'],
        ])->index(new Request(['per_page' => 500]))->getData(true)['data']['data'] ?? [];

        $notifications = Schema::hasTable('notifications')
            ? DB::table('notifications')->orderByDesc('created_at')->limit(200)->get()->values()
            : [];

        $appSettings = Schema::hasTable('app_settings')
            ? DB::table('app_settings')->where('setting_key', '!=', 'admin_password_hash')->get()->values()
            : [];

        $countries = Schema::hasTable('countries')
            ? DB::table('countries')->orderBy('id')->get()->values()
            : [];

        $users = Schema::hasTable('users')
            ? DB::table('users')->select(['id', 'phone', 'country_id', 'is_active'])->orderByDesc('id')->limit(500)->get()->values()
            : [];

        $userLimits = Schema::hasTable('user_limits')
            ? DB::table('user_limits')->get()->values()
            : [];

        $defaultLimits = Schema::hasTable('default_limits')
            ? DB::table('default_limits')->get()->values()
            : [];

        $iconOverrides = Schema::hasTable('icon_overrides')
            ? DB::table('icon_overrides')->get()->values()
            : [];

        $valuationReports = Schema::hasTable('valuation_reports')
            ? DB::table('valuation_reports')->orderByDesc('created_at')->limit(200)->get()->values()
            : [];

        return response()->json([
            'success' => true,
            'data' => [
                'ads' => $ads,
                'car_brands' => $carBrands,
                'car_models' => $carModels,
                'real_estate_categories' => $reCategories,
                'real_estate_subcategories' => $reSubcategories,
                'notifications' => $notifications,
                'app_settings' => $appSettings,
                'countries' => $countries,
                'users' => $users,
                'user_limits' => $userLimits,
                'default_limits' => $defaultLimits,
                'icon_overrides' => $iconOverrides,
                'valuation_reports' => $valuationReports,
            ],
        ]);
    }
}

