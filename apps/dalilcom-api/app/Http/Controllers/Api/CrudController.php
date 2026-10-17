<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CrudController extends Controller
{
    public function __construct(private array $config) {}

    public function index(Request $request)
    {
        $table = $this->config['table'];
        $query = DB::table($table);

        if ($table === 'app_settings') {
            $query->where('setting_key', '!=', 'admin_password_hash');
        }

        foreach ($this->config['fillable'] ?? [] as $col) {
            if ($request->filled($col)) {
                $query->where($col, $request->input($col));
            }
        }

        if ($request->filled('search') && ! empty($this->config['search'])) {
            $query->where(function ($q) use ($request) {
                foreach ($this->config['search'] as $column) {
                    $q->orWhere($column, 'like', '%' . $request->search . '%');
                }
            });
        }

        if (! empty($this->config['order'])) {
            [$column, $dir] = explode(':', $this->config['order']);
            $query->orderBy($column, $dir);
        }

        $paginator = $query->paginate($request->integer('per_page', 1000));
        $items = $paginator->getCollection();

        if ($items->isNotEmpty()) {
            if ($table === 'car_brands' && Schema::hasTable('car_specs')) {
                $counts = DB::table('car_specs')
                    ->whereNotNull('brand_id')
                    ->selectRaw('brand_id, COUNT(*) as total')
                    ->groupBy('brand_id')
                    ->pluck('total', 'brand_id');
                $paginator->setCollection($items->map(function ($row) use ($counts) {
                    $row->ads_count = (int) ($counts[$row->id] ?? 0);
                    return $row;
                }));
            } elseif ($table === 'car_models') {
                $counts = Schema::hasTable('car_specs')
                    ? DB::table('car_specs')
                        ->whereNotNull('model_id')
                        ->selectRaw('model_id, COUNT(*) as total')
                        ->groupBy('model_id')
                        ->pluck('total', 'model_id')
                    : collect();
                $brands = Schema::hasTable('car_brands')
                    ? DB::table('car_brands')->get()->keyBy('id')
                    : collect();
                $paginator->setCollection($items->map(function ($row) use ($counts, $brands) {
                    $row->ads_count = (int) ($counts[$row->id] ?? 0);
                    $brand = $brands->get($row->brand_id);
                    $row->brand_en_name = $brand->en_name ?? '';
                    $row->brand_ar_name = $brand->ar_name ?? '';
                    return $row;
                }));
            } elseif ($table === 'real_estate_categories' && Schema::hasTable('real_estate_specs')) {
                $counts = DB::table('real_estate_specs')
                    ->whereNotNull('category_id')
                    ->selectRaw('category_id, COUNT(*) as total')
                    ->groupBy('category_id')
                    ->pluck('total', 'category_id');
                $paginator->setCollection($items->map(function ($row) use ($counts) {
                    $row->ads_count = (int) ($counts[$row->id] ?? 0);
                    return $row;
                }));
            } elseif ($table === 'real_estate_subcategories' && Schema::hasTable('real_estate_specs')) {
                $counts = DB::table('real_estate_specs')
                    ->whereNotNull('subcategory_id')
                    ->selectRaw('subcategory_id, COUNT(*) as total')
                    ->groupBy('subcategory_id')
                    ->pluck('total', 'subcategory_id');
                $paginator->setCollection($items->map(function ($row) use ($counts) {
                    $row->ads_count = (int) ($counts[$row->id] ?? 0);
                    return $row;
                }));
            }
        }

        return response()->json(['success' => true, 'data' => $paginator]);
    }

    public function show(string $id)
    {
        if ($this->config['table'] === 'app_settings' && $id === 'admin_password_hash') {
            abort(403, 'Forbidden');
        }
        $row = DB::table($this->config['table'])->where($this->config['key'], $id)->first();
        abort_if(! $row, 404, 'Record not found');
        return response()->json(['success' => true, 'data' => $row]);
    }

    public function store(Request $request)
    {
        $table = $this->config['table'];
        $key = $this->config['key'];
        $data = $request->only($this->config['fillable']);
        abort_if(empty($data), 422, 'No valid fields provided');
        if ($table === 'app_settings' && ($data[$key] ?? null) === 'admin_password_hash') {
            abort(403, 'Forbidden');
        }

        // Idempotent handling for users by phone
        if ($table === 'users' && !empty($data['phone'])) {
            $existing = DB::table('users')->where('phone', $data['phone'])->first();
            if ($existing) {
                DB::table('users')->where('id', $existing->id)->update(array_merge($data, ['updated_at' => now()]));
                $updated = DB::table('users')->where('id', $existing->id)->first();
                return response()->json(['success' => true, 'data' => $updated], 200);
            }
            $data['created_at'] = now();
            $data['updated_at'] = now();
        }

        if ($this->config['incrementing'] ?? true) {
            $id = DB::table($table)->insertGetId($data);
            $row = DB::table($table)->where($key, $id)->first();
            return response()->json(['success' => true, 'data' => $row ?? (['id' => $id] + $data)], 201);
        }

        if (isset($data[$key])) {
            $values = array_diff_key($data, [$key => true]);
            if ($table === 'app_settings') {
                $values['updated_at'] = now();
            }
            DB::table($table)->updateOrInsert([$key => $data[$key]], $values);
            $row = DB::table($table)->where($key, $data[$key])->first();
            return response()->json(['success' => true, 'data' => $row ?? $data], 201);
        }

        DB::table($table)->insert($data);
        return response()->json(['success' => true, 'data' => $data], 201);
    }

    public function update(Request $request, string $id)
    {
        $table = $this->config['table'];
        if ($table === 'app_settings' && $id === 'admin_password_hash') {
            abort(403, 'Forbidden');
        }
        $key = $this->config['key'];
        $data = $request->only($this->config['fillable']);
        abort_if(empty($data), 422, 'No valid fields provided');

        if (!($this->config['incrementing'] ?? true)) {
            $values = array_diff_key($data, [$key => true]);
            if ($table === 'app_settings') {
                $values['updated_at'] = now();
            }
            DB::table($table)->updateOrInsert([$key => $id], $values);
            return $this->show($id);
        }

        DB::table($table)->where($key, $id)->update($data);
        return $this->show($id);
    }

    public function destroy(string $id)
    {
        if ($this->config['table'] === 'app_settings' && $id === 'admin_password_hash') {
            abort(403, 'Forbidden');
        }
        $deleted = DB::table($this->config['table'])->where($this->config['key'], $id)->delete();
        abort_if(! $deleted, 404, 'Record not found');
        return response()->json(['success' => true, 'data' => ['deleted' => true]]);
    }
}
