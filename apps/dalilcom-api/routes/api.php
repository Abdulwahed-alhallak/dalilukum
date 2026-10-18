<?php

use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\AppUpdateController;
use App\Http\Controllers\Api\CrudController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\SystemController;
use Illuminate\Support\Facades\Route;

$resources = [
    'countries' => ['table' => 'countries', 'key' => 'id', 'fillable' => ['name', 'phone_code', 'flag', 'phone_mask'], 'search' => ['name', 'phone_code'], 'order' => 'id:desc'],
    'users' => ['table' => 'users', 'key' => 'id', 'fillable' => ['phone', 'country_id', 'is_active'], 'search' => ['phone'], 'order' => 'id:desc'],
    'car-brands' => ['table' => 'car_brands', 'key' => 'id', 'fillable' => ['ar_name', 'en_name', 'ads_count', 'domain', 'icon', 'image_url'], 'search' => ['ar_name', 'en_name'], 'order' => 'ads_count:desc'],
    'car-models' => ['table' => 'car_models', 'key' => 'id', 'fillable' => ['brand_id', 'ar_name', 'en_name', 'ads_count'], 'search' => ['ar_name', 'en_name'], 'order' => 'ads_count:desc'],
    'real-estate/categories' => ['table' => 'real_estate_categories', 'key' => 'id', 'incrementing' => false, 'fillable' => ['id', 'ar_name', 'en_name', 'ads_count', 'image_url', 'icon'], 'search' => ['ar_name', 'en_name'], 'order' => 'ads_count:desc'],
    'real-estate/subcategories' => ['table' => 'real_estate_subcategories', 'key' => 'id', 'fillable' => ['category_id', 'ar_name', 'en_name', 'ads_count', 'image_url'], 'search' => ['ar_name', 'en_name'], 'order' => 'ads_count:desc'],
    'notifications' => ['table' => 'notifications', 'key' => 'id', 'incrementing' => false, 'fillable' => ['id', 'user_id', 'title', 'body', 'display_date', 'is_read'], 'order' => 'created_at:desc'],
    'user-limits' => ['table' => 'user_limits', 'key' => 'user_id', 'incrementing' => false, 'fillable' => ['user_id', 'max_images', 'max_videos']],
    'default-limits' => ['table' => 'default_limits', 'key' => 'id', 'fillable' => ['id', 'max_images', 'max_videos']],
    'favorites' => ['table' => 'favorites', 'key' => 'user_id', 'incrementing' => false, 'fillable' => ['user_id', 'ad_id'], 'order' => 'created_at:desc'],
    'comparisons' => ['table' => 'comparisons', 'key' => 'id', 'fillable' => ['user_id'], 'order' => 'created_at:desc'],
    'comparison-items' => ['table' => 'comparison_items', 'key' => 'comparison_id', 'incrementing' => false, 'fillable' => ['comparison_id', 'ad_id', 'sort_order'], 'order' => 'sort_order:asc'],
    'icon-overrides' => ['table' => 'icon_overrides', 'key' => 'override_key', 'incrementing' => false, 'fillable' => ['override_key', 'icon_name'], 'search' => ['override_key', 'icon_name']],
    'valuation-reports' => ['table' => 'valuation_reports', 'key' => 'id', 'incrementing' => false, 'fillable' => ['id', 'type', 'title', 'specs', 'estimated_price', 'min_price', 'max_price', 'report_date'], 'search' => ['title', 'specs'], 'order' => 'created_at:desc'],
    'app-settings' => ['table' => 'app_settings', 'key' => 'setting_key', 'incrementing' => false, 'fillable' => ['setting_key', 'setting_value'], 'search' => ['setting_key']],
];

Route::get('health', [SystemController::class, 'health']);
Route::get('stats', [SystemController::class, 'stats']);
Route::get('app/update-check', [AppUpdateController::class, 'check']);
Route::post('app/update-report', [AppUpdateController::class, 'report']);
Route::apiResource('ads', AdController::class);
Route::get('favorites', [FavoriteController::class, 'index']);
Route::post('favorites', [FavoriteController::class, 'store']);
Route::delete('favorites/{adId}', [FavoriteController::class, 'destroy']);

foreach ($resources as $uri => $config) {
    if ($uri === 'favorites') continue;
    Route::get($uri, fn ($request = null) => app(CrudController::class, ['config' => $config])->index(request()));
    Route::post($uri, fn () => app(CrudController::class, ['config' => $config])->store(request()));
    Route::get($uri.'/{id}', fn ($id) => app(CrudController::class, ['config' => $config])->show($id));
    Route::match(['put', 'patch'], $uri.'/{id}', fn ($id) => app(CrudController::class, ['config' => $config])->update(request(), $id));
    Route::delete($uri.'/{id}', fn ($id) => app(CrudController::class, ['config' => $config])->destroy($id));
}
