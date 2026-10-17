<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $userId = $this->resolveUserId($request, false);
        if (!$userId) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $rows = DB::table('favorites')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function store(Request $request)
    {
        $adId = $request->input('ad_id');
        abort_if(! $adId, 422, 'ad_id is required');

        $userId = $this->resolveUserId($request, true);
        abort_if(! $userId, 422, 'user_id or phone is required');

        DB::table('favorites')->updateOrInsert(
            ['user_id' => $userId, 'ad_id' => $adId],
            ['created_at' => now()]
        );

        return response()->json(['success' => true, 'data' => [
            'user_id' => $userId,
            'ad_id' => $adId,
        ]], 201);
    }

    public function destroy(Request $request, string $adId)
    {
        $userId = $this->resolveUserId($request, true);
        if (!$userId) {
            return response()->json(['success' => true, 'data' => ['deleted' => false]]);
        }

        $deleted = DB::table('favorites')
            ->where('user_id', $userId)
            ->where('ad_id', $adId)
            ->delete();

        return response()->json(['success' => true, 'data' => [
            'deleted' => (bool) $deleted,
        ]]);
    }

    private function resolveUserId(Request $request, bool $fallbackIfEmpty = false): ?int
    {
        $requested = $request->integer('user_id');
        if ($requested && DB::table('users')->where('id', $requested)->exists()) {
            return $requested;
        }

        if ($request->filled('phone')) {
            $phone = trim((string) $request->input('phone'));
            if ($phone !== '') {
                $byPhone = DB::table('users')->where('phone', $phone)->value('id');
                if ($byPhone) {
                    return (int) $byPhone;
                }
                $countryId = DB::table('countries')->where('phone_code', '+963')->value('id')
                    ?? DB::table('countries')->orderBy('id')->value('id');
                try {
                    return (int) DB::table('users')->insertGetId([
                        'phone' => $phone,
                        'country_id' => $countryId,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Throwable $e) {
                    return (int) DB::table('users')->where('phone', $phone)->value('id') ?: null;
                }
            }
        }

        if ($fallbackIfEmpty) {
            return (int) DB::table('users')->orderBy('id')->value('id') ?: null;
        }

        return null;
    }
}
