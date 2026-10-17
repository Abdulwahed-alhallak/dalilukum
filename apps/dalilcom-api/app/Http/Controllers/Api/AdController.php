<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdController extends Controller
{
    private array $adFields = [
        'id',
        'owner_user_id',
        'category',
        'title',
        'description',
        'price',
        'currency',
        'location',
        'subcategory',
        'purpose',
        'cover_image_url',
        'is_featured',
        'published_on',
        'owner_phone',
        'whatsapp_phone',
        'map_url',
        'latitude',
        'longitude',
    ];

    private array $columnCache = [];

    public function index(Request $request)
    {
        $query = DB::table('ads')->orderByDesc('created_at');
        $query->when($request->category, fn ($q, $v) => $q->where('category', $v));
        $query->when($request->owner_user_id, fn ($q, $v) => $q->where('owner_user_id', $v));
        $query->when($request->search, function ($q, $v) {
            $q->where(function ($sub) use ($v) {
                $sub->where('title', 'like', "%$v%")
                    ->orWhere('location', 'like', "%$v%")
                    ->orWhere('description', 'like', "%$v%");
            });
        });

        $ads = $query->paginate($request->integer('per_page', 100));
        $items = $ads->getCollection();

        if ($items->isNotEmpty()) {
            $adIds = $items->pluck('id')->all();

            $imagesByAd = DB::table('ad_images')
                ->whereIn('ad_id', $adIds)
                ->orderBy('sort_order')
                ->get()
                ->groupBy('ad_id');

            $videosByAd = DB::table('ad_videos')
                ->whereIn('ad_id', $adIds)
                ->orderBy('sort_order')
                ->get()
                ->groupBy('ad_id');

            $detailsByAd = DB::table('ad_details')
                ->whereIn('ad_id', $adIds)
                ->orderBy('sort_order')
                ->get()
                ->groupBy('ad_id');

            $carSpecsByAd = DB::table('car_specs')
                ->leftJoin('car_brands', 'car_specs.brand_id', '=', 'car_brands.id')
                ->leftJoin('car_models', 'car_specs.model_id', '=', 'car_models.id')
                ->select('car_specs.*', 'car_brands.ar_name as brand_name', 'car_models.ar_name as model_name')
                ->whereIn('car_specs.ad_id', $adIds)
                ->get()
                ->keyBy('ad_id');

            $reSpecsByAd = DB::table('real_estate_specs')
                ->whereIn('ad_id', $adIds)
                ->get()
                ->keyBy('ad_id');

            $projectSpecsByAd = Schema::hasTable('project_specs')
                ? DB::table('project_specs')->whereIn('ad_id', $adIds)->get()->keyBy('ad_id')
                : collect();

            $facilitiesByAd = Schema::hasTable('project_facilities')
                ? DB::table('project_facilities')->whereIn('ad_id', $adIds)->get()->groupBy('ad_id')
                : collect();

            $amenitiesByAd = Schema::hasTable('project_amenities')
                ? DB::table('project_amenities')->whereIn('ad_id', $adIds)->get()->groupBy('ad_id')
                : collect();

            $ads->setCollection($items->map(function ($ad) use (
                $imagesByAd,
                $videosByAd,
                $detailsByAd,
                $carSpecsByAd,
                $reSpecsByAd,
                $projectSpecsByAd,
                $facilitiesByAd,
                $amenitiesByAd
            ) {
                $pSpec = $projectSpecsByAd->get($ad->id);
                if ($pSpec) {
                    $pSpec = clone $pSpec;
                    $pSpec->facilities = ($facilitiesByAd->get($ad->id) ?? collect())->pluck('facility')->values()->all();
                    $pSpec->amenities = ($amenitiesByAd->get($ad->id) ?? collect())->pluck('amenity')->values()->all();
                }

                return [
                    'ad' => $ad,
                    'images' => ($imagesByAd->get($ad->id) ?? collect())->values(),
                    'videos' => ($videosByAd->get($ad->id) ?? collect())->values(),
                    'details' => ($detailsByAd->get($ad->id) ?? collect())->values(),
                    'car_specs' => $carSpecsByAd->get($ad->id),
                    'real_estate_specs' => $reSpecsByAd->get($ad->id),
                    'project_specs' => $pSpec,
                ];
            }));
        }

        return response()->json(['success' => true, 'data' => $ads]);
    }

    public function show(string $id)
    {
        $ad = DB::table('ads')->where('id', $id)->first();
        abort_if(! $ad, 404, 'Ad not found');
        return response()->json(['success' => true, 'data' => $this->withRelations($ad)]);
    }

    public function store(Request $request)
    {
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            DB::reconnect();
        }

        $input = $request->only($this->adFields);
        if (!$request->filled('map_url') && $request->filled('mapUrl')) {
            $input['map_url'] = $request->input('mapUrl');
        }
        $rawCat = $input['category'] ?? $request->input('type') ?? 'real-estate';
        $input['category'] = in_array($rawCat, ['cars', 'سيارات', 'car'], true) ? 'cars' : 'real-estate';
        $data = $this->onlyExistingColumns('ads', $input);
        $data['id'] ??= ($data['category'] ?? 'ad') . '-' . now()->timestamp . '-' . substr(uniqid(), -4);
        $data['currency'] ??= 'ل.س';
        $data['location'] ??= $request->input('city', 'دمشق');
        $data['published_on'] ??= now()->toDateString();
        $data['created_at'] = now();
        $data['updated_at'] = now();

        if (!empty($data['cover_image_url'])) {
            $data['cover_image_url'] = $this->saveBase64Image($data['cover_image_url'], $data['id'], '_cover');
        }

        DB::transaction(function () use ($request, $data) {
            DB::table('ads')->updateOrInsert(
                ['id' => $data['id']],
                array_diff_key($data, ['id' => true])
            );
            $this->syncChildren($data['id'], $request, $data['cover_image_url'] ?? null);

            if (Schema::hasTable('notifications')) {
                DB::table('notifications')->updateOrInsert(
                    ['id' => 'notif-' . $data['id']],
                    [
                        'user_id' => $data['owner_user_id'] ?? null,
                        'title' => 'تم نشر إعلان جديد',
                        'body' => ($data['title'] ?? 'إعلان جديد') . ' — ' . ($data['location'] ?? ''),
                        'display_date' => now()->toDateString(),
                        'is_read' => false,
                        'created_at' => now(),
                    ]
                );
            }
        });

        return $this->show($data['id']);
    }

    public function update(Request $request, string $id)
    {
        abort_if(! DB::table('ads')->where('id', $id)->exists(), 404, 'Ad not found');

        $input = $request->only(array_diff($this->adFields, ['id']));
        if (!$request->filled('map_url') && $request->has('mapUrl')) {
            $input['map_url'] = $request->input('mapUrl');
        }
        $data = $this->onlyExistingColumns('ads', $input);
        $data['updated_at'] = now();

        if (!empty($data['cover_image_url'])) {
            $data['cover_image_url'] = $this->saveBase64Image($data['cover_image_url'], $id, '_cover');
        }

        DB::transaction(function () use ($request, $id, $data) {
            if ($data) {
                DB::table('ads')->where('id', $id)->update($data);
            }
            $this->syncChildren($id, $request, $data['cover_image_url'] ?? null);
        });

        return $this->show($id);
    }

    public function destroy(string $id)
    {
        $deleted = DB::table('ads')->where('id', $id)->delete();
        abort_if(! $deleted, 404, 'Ad not found');
        if (Schema::hasTable('notifications')) {
            DB::table('notifications')->where('id', 'notif-' . $id)->delete();
        }
        return response()->json(['success' => true, 'data' => ['deleted' => true]]);
    }

    private function withRelations(object $ad): array
    {
        $carSpecs = DB::table('car_specs')
            ->leftJoin('car_brands', 'car_specs.brand_id', '=', 'car_brands.id')
            ->leftJoin('car_models', 'car_specs.model_id', '=', 'car_models.id')
            ->select('car_specs.*', 'car_brands.ar_name as brand_name', 'car_models.ar_name as model_name')
            ->where('car_specs.ad_id', $ad->id)
            ->first();

        $projectSpecs = null;
        if (Schema::hasTable('project_specs')) {
            $projectSpecs = DB::table('project_specs')->where('ad_id', $ad->id)->first();
            if ($projectSpecs) {
                $projectSpecs->facilities = Schema::hasTable('project_facilities')
                    ? DB::table('project_facilities')->where('ad_id', $ad->id)->pluck('facility')->values()->all()
                    : [];
                $projectSpecs->amenities = Schema::hasTable('project_amenities')
                    ? DB::table('project_amenities')->where('ad_id', $ad->id)->pluck('amenity')->values()->all()
                    : [];
            }
        }

        return [
            'ad' => $ad,
            'images' => DB::table('ad_images')->where('ad_id', $ad->id)->orderBy('sort_order')->get(),
            'videos' => DB::table('ad_videos')->where('ad_id', $ad->id)->orderBy('sort_order')->get(),
            'details' => DB::table('ad_details')->where('ad_id', $ad->id)->orderBy('sort_order')->get(),
            'car_specs' => $carSpecs,
            'real_estate_specs' => DB::table('real_estate_specs')->where('ad_id', $ad->id)->first(),
            'project_specs' => $projectSpecs,
        ];
    }

    private function saveBase64Image(?string $base64String, string $adId, string $suffix = ''): ?string
    {
        if (empty($base64String)) {
            return null;
        }
        if (!str_starts_with($base64String, 'data:image')) {
            return $base64String;
        }

        @list($type, $file_data) = explode(';', $base64String);
        @list(, $file_data) = explode(',', $file_data);

        $extension = 'jpg';
        if (str_contains($type, 'png')) $extension = 'png';
        if (str_contains($type, 'gif')) $extension = 'gif';
        if (str_contains($type, 'webp')) $extension = 'webp';

        $fileName = 'ad_' . $adId . '_' . uniqid() . $suffix . '.' . $extension;
        $path = public_path('images/ads');
        if (!file_exists($path)) {
            mkdir($path, 0777, true);
        }

        file_put_contents($path . '/' . $fileName, base64_decode($file_data));

        return url('/images/ads/' . $fileName);
    }

    private function saveBase64Video(?string $base64String, string $adId, string $suffix = ''): ?string
    {
        if (empty($base64String)) {
            return null;
        }
        if (!str_starts_with($base64String, 'data:video')) {
            return $base64String;
        }

        @list($type, $fileData) = explode(';', $base64String);
        @list(, $fileData) = explode(',', $fileData);
        $extension = 'mp4';
        if (str_contains($type, 'webm')) $extension = 'webm';
        if (str_contains($type, 'ogg')) $extension = 'ogv';
        if (str_contains($type, 'quicktime')) $extension = 'mov';

        $fileName = 'ad_' . $adId . '_' . uniqid() . $suffix . '.' . $extension;
        $path = public_path('videos/ads');
        if (!file_exists($path)) {
            mkdir($path, 0777, true);
        }
        file_put_contents($path . '/' . $fileName, base64_decode($fileData));

        return url('/videos/ads/' . $fileName);
    }

    private function syncChildren(string $id, Request $request, ?string $coverImageUrl = null): void
    {
        if ($request->has('images')) {
            DB::table('ad_images')->where('ad_id', $id)->delete();
            foreach ($request->input('images', []) as $i => $url) {
                $savedUrl = ($i === 0 && $coverImageUrl) ? $coverImageUrl : $this->saveBase64Image($url, $id, '_img' . $i);
                if ($savedUrl) {
                    DB::table('ad_images')->insert([
                        'ad_id' => $id,
                        'image_url' => $savedUrl,
                        'sort_order' => $i,
                        'is_cover' => $i === 0,
                    ]);
                }
            }
        }

        if ($request->has('videos')) {
            DB::table('ad_videos')->where('ad_id', $id)->delete();
            foreach ($request->input('videos', []) as $i => $url) {
                $savedUrl = $this->saveBase64Video($url, $id, '_video' . $i);
                if ($savedUrl) {
                    DB::table('ad_videos')->insert([
                        'ad_id' => $id,
                        'video_url' => $savedUrl,
                        'sort_order' => $i,
                    ]);
                }
            }
        }

        if ($request->has('details') || $request->has('specs')) {
            DB::table('ad_details')->where('ad_id', $id)->delete();
            $details = $this->mergedDetails($request);
            foreach ($details as $i => $text) {
                DB::table('ad_details')->insert([
                    'ad_id' => $id,
                    'detail_text' => mb_substr((string) $text, 0, 250),
                    'sort_order' => $i,
                ]);
            }
        }

        if ($request->has('specs') || $request->has('car_specs') || $request->has('real_estate_specs') || $request->has('project_specs')) {
            $specs = array_merge(
                (array) $request->input('car_specs', []),
                (array) $request->input('real_estate_specs', []),
                (array) $request->input('project_specs', []),
                (array) $request->input('specs', [])
            );
            if ($request->has('project_facilities') && !isset($specs['projectFacilities'])) {
                $specs['projectFacilities'] = $request->input('project_facilities');
            }
            if ($request->has('project_amenities') && !isset($specs['projectAmenities'])) {
                $specs['projectAmenities'] = $request->input('project_amenities');
            }

            $adRow = DB::table('ads')->where('id', $id)->first();
            $category = $adRow->category ?? ($request->input('category') ?? 'real-estate');
            $subcategory = $request->input('subcategory') ?? ($adRow->subcategory ?? null);

            if ($category === 'cars') {
                DB::table('car_specs')->where('ad_id', $id)->delete();
                if (!empty($specs)) {
                    $brandName = trim((string) ($specs['brand'] ?? $specs['brand_name'] ?? ''));
                    $modelName = trim((string) ($specs['model'] ?? $specs['model_name'] ?? ''));

                    $brandId = $specs['brand_id'] ?? ($brandName !== ''
                        ? DB::table('car_brands')
                            ->where('ar_name', $brandName)
                            ->orWhere('en_name', $brandName)
                            ->value('id')
                        : null);

                    $modelQuery = DB::table('car_models');
                    if ($brandId) {
                        $modelQuery->where('brand_id', $brandId);
                    }
                    $modelId = $specs['model_id'] ?? ($modelName !== ''
                        ? $modelQuery->where(function ($q) use ($modelName) {
                            $q->where('ar_name', $modelName)->orWhere('en_name', $modelName);
                        })->value('id')
                        : null);

                    $hasWarranty = null;
                    if (isset($specs['carWarranty'])) {
                        $hasWarranty = is_bool($specs['carWarranty'])
                            ? $specs['carWarranty']
                            : in_array($specs['carWarranty'], ['نعم', 'مكفولة', 'تحت الكفالة', '1', 'true'], true);
                    } elseif (isset($specs['has_warranty'])) {
                        $hasWarranty = (bool) $specs['has_warranty'];
                    }

                    DB::table('car_specs')->insert($this->onlyExistingColumns('car_specs', [
                        'ad_id' => $id,
                        'brand_id' => $brandId,
                        'model_id' => $modelId,
                        'model_year' => is_numeric($specs['year'] ?? $specs['model_year'] ?? null) ? (int) ($specs['year'] ?? $specs['model_year']) : null,
                        'transmission' => $specs['gear'] ?? $specs['transmission'] ?? null,
                        'fuel_type' => $specs['fuel'] ?? $specs['fuel_type'] ?? null,
                        'mileage' => is_numeric($specs['carMileage'] ?? $specs['mileage'] ?? null) ? (int) ($specs['carMileage'] ?? $specs['mileage']) : null,
                        'body_type' => $specs['carBodyType'] ?? $specs['body_type'] ?? null,
                        'car_condition' => $specs['carCondition'] ?? $specs['car_condition'] ?? null,
                        'car_type' => $specs['carType'] ?? $specs['car_type'] ?? null,
                        'color' => $specs['carColor'] ?? $specs['color'] ?? null,
                        'engine_size' => $specs['engineSize'] ?? $specs['engine_size'] ?? null,
                        'engine_power' => $specs['enginePower'] ?? $specs['engine_power'] ?? null,
                        'drive_type' => $specs['carDrive'] ?? $specs['drive_type'] ?? null,
                        'has_warranty' => $hasWarranty,
                        'advertiser_type' => $specs['carAdvertiser'] ?? $specs['advertiser_type'] ?? null,
                    ]));
                }
            } elseif ($category === 'real-estate') {
                DB::table('real_estate_specs')->where('ad_id', $id)->delete();
                if (!empty($specs)) {
                    $subLookup = trim((string) ($subcategory ?: ($specs['propType'] ?? $specs['property_type'] ?? '')));
                    $subRow = $subLookup !== ''
                        ? DB::table('real_estate_subcategories')
                            ->where('ar_name', $subLookup)
                            ->orWhere('en_name', $subLookup)
                            ->first()
                        : null;

                    $catId = $specs['category_id'] ?? ($subRow->category_id ?? null);
                    if (!$catId && !empty($specs['reType'])) {
                        $catId = DB::table('real_estate_categories')
                            ->where('id', $specs['reType'])
                            ->orWhere('ar_name', $specs['reType'])
                            ->orWhere('en_name', $specs['reType'])
                            ->value('id');
                    }
                    if (!$catId) {
                        $combined = $subLookup . ' ' . ($specs['reType'] ?? '') . ' ' . ($specs['propType'] ?? '');
                        if (str_contains($combined, 'مشروع') || str_contains($combined, 'مشاريع') || !empty($specs['projectStatus']) || !empty($specs['project_status'])) {
                            $catId = 'projects';
                        } elseif (str_contains($combined, 'فيلا') || str_contains($combined, 'مزرع') || str_contains($combined, 'شاليه')) {
                            $catId = 'villas';
                        } elseif (str_contains($combined, 'أرض') || str_contains($combined, 'اراض')) {
                            $catId = 'lands';
                        } elseif (str_contains($combined, 'محل') || str_contains($combined, 'مكتب') || str_contains($combined, 'مستودع') || str_contains($combined, 'تجار')) {
                            $catId = 'shops';
                        } elseif (str_contains($combined, 'بناء') || str_contains($combined, 'عمار')) {
                            $catId = 'buildings';
                        } elseif (str_contains($combined, 'عربي')) {
                            $catId = 'arabic';
                        } else {
                            $catId = 'apartments';
                        }
                    }
                    if ($catId && !DB::table('real_estate_categories')->where('id', $catId)->exists()) {
                        $catId = DB::table('real_estate_categories')->orderBy('id')->value('id');
                    }

                    $rawArea = $specs['minArea'] ?? $specs['projectLandArea'] ?? $specs['reArea'] ?? $specs['area_size'] ?? null;
                    $numericArea = null;
                    if ($rawArea !== null && preg_match('/(\d+(?:\.\d+)?)/', (string) $rawArea, $m)) {
                        $numericArea = (float) $m[1];
                    }

                    $rawNetArea = $specs['minNetArea'] ?? $specs['net_area'] ?? null;
                    $numericNetArea = null;
                    if ($rawNetArea !== null && preg_match('/(\d+(?:\.\d+)?)/', (string) $rawNetArea, $m2)) {
                        $numericNetArea = (float) $m2[1];
                    }

                    $rawRooms = $specs['bedsCount'] ?? $specs['reRooms'] ?? $specs['rooms'] ?? null;
                    $numericRooms = null;
                    if ($rawRooms !== null && preg_match('/(\d+)/', (string) $rawRooms, $mr)) {
                        $numericRooms = (int) $mr[1];
                    }

                    $rawBaths = $specs['reBaths'] ?? $specs['bathrooms'] ?? null;
                    $numericBaths = null;
                    if ($rawBaths !== null && preg_match('/(\d+)/', (string) $rawBaths, $mb)) {
                        $numericBaths = (int) $mb[1];
                    }

                    $hasElevator = null;
                    if (isset($specs['hasElevator'])) {
                        $hasElevator = is_bool($specs['hasElevator'])
                            ? $specs['hasElevator']
                            : in_array($specs['hasElevator'], ['نعم', 'يوجد', '1', 'true'], true);
                    }

                    $hasParking = null;
                    if (isset($specs['hasParking'])) {
                        $hasParking = is_bool($specs['hasParking'])
                            ? $specs['hasParking']
                            : in_array($specs['hasParking'], ['نعم', 'يوجد', '1', 'true'], true);
                    }

                    DB::table('real_estate_specs')->insert($this->onlyExistingColumns('real_estate_specs', [
                        'ad_id' => $id,
                        'category_id' => $catId,
                        'subcategory_id' => $specs['subcategory_id'] ?? ($subRow->id ?? null),
                        'property_type' => $specs['propType'] ?? $specs['property_type'] ?? $subcategory ?? null,
                        'rooms' => isset($specs['reRooms']) ? (string) $specs['reRooms'] : (isset($specs['rooms']) ? (string) $specs['rooms'] : null),
                        'bathrooms' => isset($specs['reBaths']) ? (string) $specs['reBaths'] : (isset($specs['bathrooms']) ? (string) $specs['bathrooms'] : null),
                        'bedrooms' => $numericRooms,
                        'bathrooms_count' => $numericBaths,
                        'area_text' => $specs['reArea'] ?? ($numericArea ? $numericArea . ' م²' : null),
                        'area_size' => $numericArea,
                        'net_area' => $numericNetArea,
                        'floor' => $specs['reFloor'] ?? $specs['floor_number'] ?? $specs['floor'] ?? null,
                        'total_floors' => $specs['buildingTotalFloors'] ?? $specs['projectFloors'] ?? $specs['total_floors'] ?? null,
                        'furnished' => $specs['reFurnished'] ?? $specs['furnished'] ?? null,
                        'building_age' => $specs['reBuildingAge'] ?? $specs['building_age'] ?? null,
                        'title_deed_type' => $specs['titleDeedType'] ?? $specs['title_deed_type'] ?? null,
                        'advertiser_type' => $specs['advertiserType'] ?? $specs['advertiser_type'] ?? null,
                        'heating_type' => $specs['heatingType'] ?? $specs['heating_type'] ?? null,
                        'property_direction' => $specs['propertyDirection'] ?? $specs['property_direction'] ?? null,
                        'has_elevator' => $hasElevator,
                        'has_parking' => $hasParking,
                    ]));

                    // Sync project_specs, project_facilities, project_amenities if applicable
                    if (Schema::hasTable('project_specs')) {
                        DB::table('project_specs')->where('ad_id', $id)->delete();
                        $pStatus = $specs['projectStatus'] ?? $specs['project_status'] ?? $specs['Completion_status'] ?? null;
                        $pYear = $specs['deliveryYear'] ?? $specs['delivery_year'] ?? $specs['delivery_date'] ?? null;
                        $pFloors = $specs['projectFloors'] ?? $specs['project_floors'] ?? null;
                        $pType = $specs['projectType'] ?? $specs['project_type'] ?? null;
                        $pFin = $specs['projectFinishing'] ?? $specs['project_finishing'] ?? null;
                        $pLand = $specs['projectLandArea'] ?? $specs['project_land_area'] ?? null;
                        $pUnits = $specs['projectUnitsCount'] ?? $specs['project_units_count'] ?? null;
                        $pPlan = $specs['paymentPlan'] ?? $specs['payment_plan'] ?? null;

                        $hasProjectData = $pStatus || $pYear || $pFloors || $pType || $pFin || $pLand || $pUnits || $pPlan;

                        if ($hasProjectData) {
                            DB::table('project_specs')->insert($this->onlyExistingColumns('project_specs', [
                                'ad_id' => $id,
                                'project_status' => $pStatus,
                                'delivery_year' => $pYear,
                                'project_floors' => is_numeric($pFloors) ? (int) $pFloors : null,
                                'project_type' => $pType,
                                'project_finishing' => $pFin,
                                'project_land_area' => is_numeric($pLand) ? (float) $pLand : null,
                                'project_units_count' => is_numeric($pUnits) ? (int) $pUnits : null,
                                'payment_plan' => $pPlan,
                            ]));
                        }
                    }

                    if (Schema::hasTable('project_facilities')) {
                        DB::table('project_facilities')->where('ad_id', $id)->delete();
                        $facilities = $specs['projectFacilities'] ?? [];
                        if (is_string($facilities)) {
                            $facilities = array_filter(array_map('trim', explode(',', $facilities)));
                        }
                        if (is_array($facilities)) {
                            foreach (array_unique(array_filter($facilities)) as $fac) {
                                DB::table('project_facilities')->insert([
                                    'ad_id' => $id,
                                    'facility' => mb_substr((string) $fac, 0, 120),
                                ]);
                            }
                        }
                    }

                    if (Schema::hasTable('project_amenities')) {
                        DB::table('project_amenities')->where('ad_id', $id)->delete();
                        $amenities = $specs['projectAmenities'] ?? [];
                        if (is_string($amenities)) {
                            $amenities = array_filter(array_map('trim', explode(',', $amenities)));
                        }
                        if (is_array($amenities)) {
                            foreach (array_unique(array_filter($amenities)) as $am) {
                                DB::table('project_amenities')->insert([
                                    'ad_id' => $id,
                                    'amenity' => mb_substr((string) $am, 0, 120),
                                ]);
                            }
                        }
                    }
                }
            }
        }
    }

    private function mergedDetails(Request $request): array
    {
        $rawDetails = $request->input('details', []);
        $details = [];
        if (is_array($rawDetails)) {
            foreach ($rawDetails as $item) {
                if (is_array($item)) {
                    $lbl = $item['label'] ?? '';
                    $val = $item['value'] ?? '';
                    $details[] = trim($lbl ? "$lbl: $val" : (string) $val);
                } elseif (is_scalar($item)) {
                    $details[] = (string) $item;
                }
            }
        }
        $specs = $request->input('specs', []);
        $category = $request->input('category');
        $generated = $category === 'cars' ? [
            $specs['brand'] ?? null,
            $specs['model'] ?? null,
            $specs['year'] ?? null,
            $specs['gear'] ?? null,
            $specs['fuel'] ?? null,
            isset($specs['carMileage']) && $specs['carMileage'] !== '' ? $specs['carMileage'] . ' كم' : null,
            $specs['carBodyType'] ?? null,
            $specs['carCondition'] ?? null,
            $specs['carType'] ?? null,
            $specs['carColor'] ?? null,
            $specs['engineSize'] ?? null,
            $specs['enginePower'] ?? null,
            $specs['carDrive'] ?? null,
            isset($specs['carWarranty']) ? (is_bool($specs['carWarranty']) ? ($specs['carWarranty'] ? 'تحت الكفالة' : null) : $specs['carWarranty']) : null,
            $specs['carAdvertiser'] ?? null,
        ] : [
            $specs['propType'] ?? null,
            $specs['reRooms'] ?? null,
            $specs['reBaths'] ?? null,
            $specs['reArea'] ?? null,
            $specs['reFloor'] ?? null,
            $specs['reFurnished'] ?? null,
            $specs['reBuildingAge'] ?? null,
            $specs['reType'] ?? null,
            $specs['projectStatus'] ?? null,
            isset($specs['deliveryYear']) && $specs['deliveryYear'] !== '' ? 'تسليم ' . $specs['deliveryYear'] : null,
            isset($specs['projectFloors']) && $specs['projectFloors'] !== '' ? $specs['projectFloors'] . ' طوابق' : null,
            $specs['projectFinishing'] ?? null,
            isset($specs['projectLandArea']) && $specs['projectLandArea'] !== '' ? $specs['projectLandArea'] . ' م² أرض' : null,
            isset($specs['projectUnitsCount']) && $specs['projectUnitsCount'] !== '' ? $specs['projectUnitsCount'] . ' وحدة' : null,
            $specs['buildingTotalFloors'] ?? null,
            $specs['bedsCount'] ?? null,
            $specs['minNetArea'] ?? null,
            $specs['maxNetArea'] ?? null,
            $specs['heatingType'] ?? null,
            $specs['kitchenType'] ?? null,
            $specs['balconyCount'] ?? null,
            isset($specs['hasElevator']) ? (is_bool($specs['hasElevator']) ? ($specs['hasElevator'] ? 'مصعد' : null) : $specs['hasElevator']) : null,
            isset($specs['hasParking']) ? (is_bool($specs['hasParking']) ? ($specs['hasParking'] ? 'موقف سيارات' : null) : $specs['hasParking']) : null,
            $specs['houseStatus'] ?? null,
            $specs['inComplex'] ?? null,
            $specs['titleDeedType'] ?? null,
            $specs['propertyDirection'] ?? null,
            $specs['advertiserType'] ?? null,
            $specs['villaFloors'] ?? null,
            $specs['landZoning'] ?? null,
            $specs['landFrontage'] ?? null,
            $specs['officeFitted'] ?? null,
            $specs['shopHasLicense'] ?? null,
            $specs['minArea'] ?? null,
            $specs['maxArea'] ?? null,
            $specs['projectType'] ?? null,
            $specs['paymentPlan'] ?? null,
            isset($specs['projectFacilities']) && is_array($specs['projectFacilities']) ? implode('، ', $specs['projectFacilities']) : ($specs['projectFacilities'] ?? null),
            isset($specs['projectAmenities']) && is_array($specs['projectAmenities']) ? implode('، ', $specs['projectAmenities']) : ($specs['projectAmenities'] ?? null),
        ];
        return array_values(array_unique(array_filter(array_map('strval', array_merge($details, $generated)))));
    }

    private function onlyExistingColumns(string $table, array $data): array
    {
        $columns = $this->columns($table);
        return array_intersect_key($data, array_flip($columns));
    }

    private function columns(string $table): array
    {
        if (!isset($this->columnCache[$table])) {
            $this->columnCache[$table] = Schema::getColumnListing($table);
        }

        return $this->columnCache[$table];
    }
}
