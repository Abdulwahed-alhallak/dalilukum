<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Fix users table to match real app schema (phone/country_id/is_active)
        //    The default Laravel users (name/email) does not match routes/api.php and dalilukum.sql
        if (Schema::hasTable('users')) {
            // Drop FKs that reference users before altering
            $fks = ['ads_owner_user_id_foreign', 'comparisons_user_id_foreign', 'favorites_user_id_foreign',
                    'notification_preferences_user_id_foreign', 'notifications_user_id_foreign', 'user_limits_user_id_foreign'];
            foreach ($fks as $fk) {
                try { DB::statement("ALTER TABLE ads DROP CONSTRAINT IF EXISTS $fk"); } catch (\Throwable $e) {}
                try { DB::statement("ALTER TABLE comparisons DROP CONSTRAINT IF EXISTS $fk"); } catch (\Throwable $e) {}
                try { DB::statement("ALTER TABLE favorites DROP CONSTRAINT IF EXISTS $fk"); } catch (\Throwable $e) {}
                try { DB::statement("ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS $fk"); } catch (\Throwable $e) {}
                try { DB::statement("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS $fk"); } catch (\Throwable $e) {}
                try { DB::statement("ALTER TABLE user_limits DROP CONSTRAINT IF EXISTS $fk"); } catch (\Throwable $e) {}
            }

            // Check if already fixed
            if (Schema::hasColumn('users', 'phone')) {
                // Already correct — just ensure FKs
            } else {
                Schema::table('users', function (Blueprint $table) {
                    // Drop old columns
                    if (Schema::hasColumn('users', 'email')) {
                        try { $table->dropUnique(['email']); } catch (\Throwable $e) {}
                    }
                });

                // Use raw SQL for reliable column changes on pgsql
                DB::statement('ALTER TABLE users DROP COLUMN IF EXISTS name');
                DB::statement('ALTER TABLE users DROP COLUMN IF EXISTS email');
                DB::statement('ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at');
                DB::statement('ALTER TABLE users DROP COLUMN IF EXISTS password');
                DB::statement('ALTER TABLE users DROP COLUMN IF EXISTS remember_token');

                DB::statement("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40) NOT NULL DEFAULT ''");
                DB::statement("ALTER TABLE users ADD COLUMN IF NOT EXISTS country_id BIGINT REFERENCES countries(id) ON DELETE SET NULL");
                DB::statement("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true");

                // Clean up placeholder defaults
                DB::statement("ALTER TABLE users ALTER COLUMN phone DROP DEFAULT");
            }

            // Re-add FKs
            try { DB::statement('ALTER TABLE ads ADD CONSTRAINT ads_owner_user_id_foreign FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE comparisons ADD CONSTRAINT comparisons_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE user_limits ADD CONSTRAINT user_limits_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'); } catch (\Throwable $e) {}
        }

        // 2) Ensure countries exists (already created manually, but ensure via migration)
        if (!Schema::hasTable('countries')) {
            Schema::create('countries', function (Blueprint $table) {
                $table->id();
                $table->string('name', 120);
                $table->string('phone_code', 12);
                $table->string('flag', 16)->nullable();
                $table->string('phone_mask', 40)->nullable();
            });
        }
    }

    public function down(): void
    {
        // No rollback — this is a forward fix
    }
};
