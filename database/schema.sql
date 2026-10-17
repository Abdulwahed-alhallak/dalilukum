CREATE DATABASE IF NOT EXISTS dalilukum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dalilukum;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS comparison_items,comparisons,favorites,notifications,notification_preferences,project_amenities,project_facilities,project_specs,real_estate_specs,car_specs,ad_details,ad_videos,ad_images,ads,real_estate_subcategories,real_estate_categories,car_models,car_brands,user_limits,default_limits,users,countries,icon_overrides,app_settings;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone_code VARCHAR(12) NOT NULL,
  flag VARCHAR(16),
  phone_mask VARCHAR(40),
  UNIQUE KEY uq_countries_phone_code (phone_code)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(40) NOT NULL,
  country_id INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_phone (phone),
  CONSTRAINT fk_users_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE default_limits (
  id TINYINT PRIMARY KEY DEFAULT 1,
  max_images INT NOT NULL DEFAULT 3,
  max_videos INT NOT NULL DEFAULT 1,
  CHECK (id=1)
) ENGINE=InnoDB;

CREATE TABLE user_limits (
  user_id BIGINT PRIMARY KEY,
  max_images INT NOT NULL DEFAULT 3,
  max_videos INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_user_limits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE car_brands (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ar_name VARCHAR(120) NOT NULL,
  en_name VARCHAR(120) NOT NULL,
  ads_count INT NOT NULL DEFAULT 0,
  domain VARCHAR(255),
  icon VARCHAR(80),
  image_url TEXT,
  UNIQUE KEY uq_car_brands_en (en_name)
) ENGINE=InnoDB;

CREATE TABLE car_models (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  brand_id BIGINT NOT NULL,
  ar_name VARCHAR(120) NOT NULL,
  en_name VARCHAR(120) NOT NULL,
  ads_count INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_car_models_brand_en (brand_id,en_name),
  CONSTRAINT fk_car_models_brand FOREIGN KEY (brand_id) REFERENCES car_brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE real_estate_categories (
  id VARCHAR(60) PRIMARY KEY,
  ar_name VARCHAR(160) NOT NULL,
  en_name VARCHAR(160) NOT NULL,
  ads_count INT NOT NULL DEFAULT 0,
  image_url TEXT,
  icon VARCHAR(80)
) ENGINE=InnoDB;

CREATE TABLE real_estate_subcategories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id VARCHAR(60) NOT NULL,
  ar_name VARCHAR(180) NOT NULL,
  en_name VARCHAR(180) NOT NULL,
  ads_count INT NOT NULL DEFAULT 0,
  image_url TEXT,
  UNIQUE KEY uq_re_sub_category_ar (category_id,ar_name),
  CONSTRAINT fk_re_sub_category FOREIGN KEY (category_id) REFERENCES real_estate_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ads (
  id VARCHAR(80) PRIMARY KEY,
  owner_user_id BIGINT NULL,
  category ENUM('cars','real-estate') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(18,2) NOT NULL DEFAULT 0,
  currency VARCHAR(40) NOT NULL,
  location VARCHAR(255) NOT NULL,
  subcategory VARCHAR(180),
  purpose VARCHAR(80),
  cover_image_url TEXT,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  published_on DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ads_category (category),
  KEY idx_ads_price (price),
  KEY idx_ads_featured (is_featured),
  KEY idx_ads_owner (owner_user_id),
  CONSTRAINT fk_ads_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE ad_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ad_id VARCHAR(80) NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_ad_images_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ad_videos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ad_id VARCHAR(80) NOT NULL,
  video_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_ad_videos_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ad_details (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ad_id VARCHAR(80) NOT NULL,
  detail_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_ad_details_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE car_specs (
  ad_id VARCHAR(80) PRIMARY KEY,
  brand_id BIGINT NULL,
  model_id BIGINT NULL,
  model_year INT NULL,
  transmission VARCHAR(80),
  fuel_type VARCHAR(80),
  mileage INT NULL,
  body_type VARCHAR(80),
  car_condition VARCHAR(120),
  car_type VARCHAR(80),
  color VARCHAR(80),
  drive_type VARCHAR(80),
  engine_size VARCHAR(80),
  engine_power VARCHAR(80),
  has_warranty TINYINT(1) NULL,
  advertiser_type VARCHAR(80),
  CONSTRAINT fk_car_specs_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  CONSTRAINT fk_car_specs_brand FOREIGN KEY (brand_id) REFERENCES car_brands(id) ON DELETE SET NULL,
  CONSTRAINT fk_car_specs_model FOREIGN KEY (model_id) REFERENCES car_models(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE real_estate_specs (
  ad_id VARCHAR(80) PRIMARY KEY,
  category_id VARCHAR(60) NULL,
  subcategory_id BIGINT NULL,
  property_type VARCHAR(100),
  rooms VARCHAR(80),
  bathrooms VARCHAR(80),
  bedrooms INT NULL,
  bathrooms_count INT NULL,
  floor VARCHAR(80),
  total_floors VARCHAR(80),
  area_text VARCHAR(100),
  area_size DECIMAL(12,2) NULL,
  net_area DECIMAL(12,2) NULL,
  furnished VARCHAR(80),
  building_age VARCHAR(100),
  title_deed_type VARCHAR(160),
  advertiser_type VARCHAR(80),
  heating_type VARCHAR(100),
  property_direction VARCHAR(80),
  has_elevator TINYINT(1) NULL,
  has_parking TINYINT(1) NULL,
  CONSTRAINT fk_re_specs_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  CONSTRAINT fk_re_specs_category FOREIGN KEY (category_id) REFERENCES real_estate_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_re_specs_subcategory FOREIGN KEY (subcategory_id) REFERENCES real_estate_subcategories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE project_specs (
  ad_id VARCHAR(80) PRIMARY KEY,
  project_status VARCHAR(160),
  delivery_year VARCHAR(40),
  project_floors INT NULL,
  project_type VARCHAR(120),
  project_finishing VARCHAR(160),
  project_land_area DECIMAL(12,2) NULL,
  project_units_count INT NULL,
  payment_plan VARCHAR(180),
  CONSTRAINT fk_project_specs_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE project_facilities (ad_id VARCHAR(80), facility VARCHAR(120), PRIMARY KEY(ad_id,facility), CONSTRAINT fk_project_facilities_ad FOREIGN KEY(ad_id) REFERENCES ads(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE project_amenities (ad_id VARCHAR(80), amenity VARCHAR(120), PRIMARY KEY(ad_id,amenity), CONSTRAINT fk_project_amenities_ad FOREIGN KEY(ad_id) REFERENCES ads(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE notifications (id VARCHAR(80) PRIMARY KEY,user_id BIGINT NULL,title VARCHAR(255) NOT NULL,body TEXT NOT NULL,display_date VARCHAR(80),is_read TINYINT(1) NOT NULL DEFAULT 0,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_notifications_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE notification_preferences (user_id BIGINT PRIMARY KEY,notify_all_new TINYINT(1) NOT NULL DEFAULT 1,notify_category ENUM('all','cars','real-estate') NOT NULL DEFAULT 'all',notify_sound TINYINT(1) NOT NULL DEFAULT 1,CONSTRAINT fk_notification_prefs_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE favorites (user_id BIGINT NOT NULL,ad_id VARCHAR(80) NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,ad_id),CONSTRAINT fk_favorites_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,CONSTRAINT fk_favorites_ad FOREIGN KEY(ad_id) REFERENCES ads(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE comparisons (id BIGINT AUTO_INCREMENT PRIMARY KEY,user_id BIGINT NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_comparisons_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE comparison_items (comparison_id BIGINT NOT NULL,ad_id VARCHAR(80) NOT NULL,sort_order INT NOT NULL DEFAULT 0,PRIMARY KEY(comparison_id,ad_id),CONSTRAINT fk_comparison_items_comparison FOREIGN KEY(comparison_id) REFERENCES comparisons(id) ON DELETE CASCADE,CONSTRAINT fk_comparison_items_ad FOREIGN KEY(ad_id) REFERENCES ads(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE icon_overrides (override_key VARCHAR(160) PRIMARY KEY,icon_name VARCHAR(80) NOT NULL) ENGINE=InnoDB;
CREATE TABLE valuation_reports (id VARCHAR(80) PRIMARY KEY,type ENUM('cars','real-estate') NOT NULL,title VARCHAR(255) NOT NULL,specs TEXT,estimated_price DECIMAL(18,2) NOT NULL DEFAULT 0,min_price DECIMAL(18,2) NOT NULL DEFAULT 0,max_price DECIMAL(18,2) NOT NULL DEFAULT 0,report_date VARCHAR(80),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE app_settings (setting_key VARCHAR(80) PRIMARY KEY,setting_value VARCHAR(255) NOT NULL,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
INSERT INTO app_settings (setting_key,setting_value) VALUES ('cars_enabled','1');
INSERT INTO default_limits (id,max_images,max_videos) VALUES (1,3,1);
