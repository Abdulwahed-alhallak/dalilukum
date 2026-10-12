<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Car brands
        Schema::create('car_brands', function (Blueprint $table) {
            $table->id();
            $table->string('ar_name', 120);
            $table->string('en_name', 120)->unique();
            $table->integer('ads_count')->default(0);
            $table->string('domain', 255)->nullable();
            $table->string('icon', 80)->nullable();
            $table->text('image_url')->nullable();
        });

        // Car models
        Schema::create('car_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('car_brands')->cascadeOnDelete();
            $table->string('ar_name', 120);
            $table->string('en_name', 120);
            $table->integer('ads_count')->default(0);
            $table->unique(['brand_id', 'en_name']);
        });

        // Real estate categories
        Schema::create('real_estate_categories', function (Blueprint $table) {
            $table->string('id', 60)->primary();
            $table->string('ar_name', 160);
            $table->string('en_name', 160);
            $table->integer('ads_count')->default(0);
            $table->text('image_url')->nullable();
            $table->string('icon', 80)->nullable();
        });

        // Real estate subcategories
        Schema::create('real_estate_subcategories', function (Blueprint $table) {
            $table->id();
            $table->string('category_id', 60);
            $table->string('ar_name', 180);
            $table->string('en_name', 180);
            $table->integer('ads_count')->default(0);
            $table->text('image_url')->nullable();
            $table->unique(['category_id', 'ar_name']);
            $table->foreign('category_id')->references('id')->on('real_estate_categories')->cascadeOnDelete();
        });

        // Ads
        Schema::create('ads', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('category', ['cars', 'real-estate']);
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 18, 2)->default(0);
            $table->string('currency', 40);
            $table->string('location', 255);
            $table->string('subcategory', 180)->nullable();
            $table->string('purpose', 80)->nullable();
            $table->text('cover_image_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->date('published_on')->nullable();
            $table->string('owner_phone', 40)->nullable();
            $table->string('whatsapp_phone', 40)->nullable();
            $table->timestamps();

            $table->index('category');
            $table->index('price');
            $table->index('is_featured');
            $table->index('owner_user_id');
        });

        // Ad images
        Schema::create('ad_images', function (Blueprint $table) {
            $table->id();
            $table->string('ad_id', 80);
            $table->text('image_url');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_cover')->default(false);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Ad videos
        Schema::create('ad_videos', function (Blueprint $table) {
            $table->id();
            $table->string('ad_id', 80);
            $table->text('video_url');
            $table->integer('sort_order')->default(0);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Ad details (bullet points)
        Schema::create('ad_details', function (Blueprint $table) {
            $table->id();
            $table->string('ad_id', 80);
            $table->string('detail_text', 255);
            $table->integer('sort_order')->default(0);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Car specs
        Schema::create('car_specs', function (Blueprint $table) {
            $table->string('ad_id', 80)->primary();
            $table->foreignId('brand_id')->nullable()->constrained('car_brands')->nullOnDelete();
            $table->foreignId('model_id')->nullable()->constrained('car_models')->nullOnDelete();
            $table->integer('model_year')->nullable();
            $table->string('transmission', 80)->nullable();
            $table->string('fuel_type', 80)->nullable();
            $table->integer('mileage')->nullable();
            $table->string('body_type', 80)->nullable();
            $table->string('car_condition', 120)->nullable();
            $table->string('car_type', 80)->nullable();
            $table->string('color', 80)->nullable();
            $table->string('drive_type', 80)->nullable();
            $table->string('engine_size', 80)->nullable();
            $table->string('engine_power', 80)->nullable();
            $table->boolean('has_warranty')->nullable();
            $table->string('advertiser_type', 80)->nullable();
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Real estate specs
        Schema::create('real_estate_specs', function (Blueprint $table) {
            $table->string('ad_id', 80)->primary();
            $table->string('category_id', 60)->nullable();
            $table->foreignId('subcategory_id')->nullable()->constrained('real_estate_subcategories')->nullOnDelete();
            $table->string('property_type', 100)->nullable();
            $table->string('rooms', 80)->nullable();
            $table->string('bathrooms', 80)->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms_count')->nullable();
            $table->string('floor', 80)->nullable();
            $table->string('total_floors', 80)->nullable();
            $table->string('area_text', 100)->nullable();
            $table->decimal('area_size', 12, 2)->nullable();
            $table->decimal('net_area', 12, 2)->nullable();
            $table->string('furnished', 80)->nullable();
            $table->string('building_age', 100)->nullable();
            $table->string('title_deed_type', 160)->nullable();
            $table->string('advertiser_type', 80)->nullable();
            $table->string('heating_type', 100)->nullable();
            $table->string('property_direction', 80)->nullable();
            $table->boolean('has_elevator')->nullable();
            $table->boolean('has_parking')->nullable();
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('real_estate_categories')->nullOnDelete();
        });

        // Project specs
        Schema::create('project_specs', function (Blueprint $table) {
            $table->string('ad_id', 80)->primary();
            $table->string('project_status', 160)->nullable();
            $table->string('delivery_year', 40)->nullable();
            $table->integer('project_floors')->nullable();
            $table->string('project_type', 120)->nullable();
            $table->string('project_finishing', 160)->nullable();
            $table->decimal('project_land_area', 12, 2)->nullable();
            $table->integer('project_units_count')->nullable();
            $table->string('payment_plan', 180)->nullable();
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Project facilities and amenities
        Schema::create('project_facilities', function (Blueprint $table) {
            $table->string('ad_id', 80);
            $table->string('facility', 120);
            $table->primary(['ad_id', 'facility']);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        Schema::create('project_amenities', function (Blueprint $table) {
            $table->string('ad_id', 80);
            $table->string('amenity', 120);
            $table->primary(['ad_id', 'amenity']);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('body');
            $table->string('display_date', 80)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        // Notification preferences
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->boolean('notify_all_new')->default(true);
            $table->enum('notify_category', ['all', 'cars', 'real-estate'])->default('all');
            $table->boolean('notify_sound')->default(true);
        });

        // Favorites
        Schema::create('favorites', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ad_id', 80);
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['user_id', 'ad_id']);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Comparisons
        Schema::create('comparisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        // Comparison items
        Schema::create('comparison_items', function (Blueprint $table) {
            $table->foreignId('comparison_id')->constrained('comparisons')->cascadeOnDelete();
            $table->string('ad_id', 80);
            $table->integer('sort_order')->default(0);
            $table->primary(['comparison_id', 'ad_id']);
            $table->foreign('ad_id')->references('id')->on('ads')->cascadeOnDelete();
        });

        // Icon overrides
        Schema::create('icon_overrides', function (Blueprint $table) {
            $table->string('override_key', 160)->primary();
            $table->string('icon_name', 80);
        });

        // Valuation reports
        Schema::create('valuation_reports', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->enum('type', ['cars', 'real-estate']);
            $table->string('title', 255);
            $table->text('specs')->nullable();
            $table->decimal('estimated_price', 18, 2)->default(0);
            $table->decimal('min_price', 18, 2)->default(0);
            $table->decimal('max_price', 18, 2)->default(0);
            $table->string('report_date', 80)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // App settings
        Schema::create('app_settings', function (Blueprint $table) {
            $table->string('setting_key', 80)->primary();
            $table->string('setting_value', 255);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Default limits
        Schema::create('default_limits', function (Blueprint $table) {
            $table->tinyInteger('id')->primary()->default(1);
            $table->integer('max_images')->default(3);
            $table->integer('max_videos')->default(1);
        });

        // User limits
        Schema::create('user_limits', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->integer('max_images')->default(3);
            $table->integer('max_videos')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_limits');
        Schema::dropIfExists('default_limits');
        Schema::dropIfExists('app_settings');
        Schema::dropIfExists('valuation_reports');
        Schema::dropIfExists('icon_overrides');
        Schema::dropIfExists('comparison_items');
        Schema::dropIfExists('comparisons');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('project_amenities');
        Schema::dropIfExists('project_facilities');
        Schema::dropIfExists('project_specs');
        Schema::dropIfExists('real_estate_specs');
        Schema::dropIfExists('car_specs');
        Schema::dropIfExists('ad_details');
        Schema::dropIfExists('ad_videos');
        Schema::dropIfExists('ad_images');
        Schema::dropIfExists('ads');
        Schema::dropIfExists('real_estate_subcategories');
        Schema::dropIfExists('real_estate_categories');
        Schema::dropIfExists('car_models');
        Schema::dropIfExists('car_brands');
        Schema::dropIfExists('countries');
    }
};

