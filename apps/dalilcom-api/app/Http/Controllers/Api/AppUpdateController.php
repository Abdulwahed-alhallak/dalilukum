<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppUpdateController extends Controller
{
    public function check(Request $request)
    {
        $platform = $request->query('platform', 'android');
        $current = (int) $request->query('version', 0);

        $row = DB::table('app_settings')->where('setting_key', 'app_version')->first();
        $latest = $row ? (int) $row->setting_value : 17;

        $forceRow = DB::table('app_settings')->where('setting_key', 'app_force_update')->first();
        $force = $forceRow ? $forceRow->setting_value === '1' : false;

        $urlRow = DB::table('app_settings')->where('setting_key', 'app_download_url')->first();
        $url = $urlRow ? $urlRow->setting_value : 'https://dalilukum.sy/dalilukum-latest.apk';

        $needsUpdate = $current < $latest;

        return response()->json([
            'success' => true,
            'data' => [
                'platform' => $platform,
                'current_version' => $current,
                'latest_version' => $latest,
                'needs_update' => $needsUpdate,
                'force_update' => $needsUpdate && $force,
                'download_url' => $url,
                'message' => $needsUpdate
                    ? ($force ? 'يجب تحديث التطبيق للمتابعة' : 'يتوفر تحديث جديد')
                    : 'تطبيقك محدث',
            ],
        ]);
    }

    public function report(Request $request)
    {
        $request->validate([
            'platform' => 'required|string',
            'version' => 'required|integer',
            'device_id' => 'nullable|string',
        ]);

        DB::table('app_update_logs')->insert([
            'platform' => $request->input('platform'),
            'version' => $request->input('version'),
            'device_id' => $request->input('device_id'),
            'ip' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json(['success' => true, 'data' => ['logged' => true]]);
    }
}
