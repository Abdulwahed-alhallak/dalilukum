import { AdItem } from './types';
import { normalizeAssetUrl } from '../services/api';

export function mapAdFromApi(row: any): AdItem {
  const ad = row.ad || row;
  const images = row.images || ad.images || [];
  const specs = row.car_specs || ad.car_specs || {};
  const reSpecs = row.real_estate_specs || ad.real_estate_specs || {};
  const projSpecs = row.project_specs || ad.project_specs || {};
  const rawDetails = row.details || ad.details || [];
  const detailTexts: string[] = rawDetails
    .map((d: any) => (typeof d === 'string' ? d : d?.detail_text))
    .filter(Boolean);

  const mapDetail = detailTexts.find((d: string) => String(d).startsWith('map_url:'));
  const cleanDetails = detailTexts.filter((d: string) => !String(d).startsWith('map_url:'));

  const synthesized = [
    specs.brand_name,
    specs.model_name,
    specs.model_year ? String(specs.model_year) : '',
    specs.transmission,
    specs.fuel_type,
    specs.mileage ? `${Number(specs.mileage).toLocaleString('en-US')} كم` : '',
    specs.body_type,
    specs.car_condition,
    specs.color,
    specs.engine_size,
    specs.engine_power,
    specs.drive_type,
    reSpecs.property_type,
    reSpecs.rooms,
    reSpecs.bathrooms,
    reSpecs.area_text || (reSpecs.net_area ? `${reSpecs.net_area} م²` : ''),
    reSpecs.floor,
    reSpecs.furnished,
    reSpecs.building_age,
    reSpecs.heating_type,
    reSpecs.title_deed_type,
    reSpecs.property_direction,
    projSpecs.project_status,
    projSpecs.delivery_year ? `تسليم ${projSpecs.delivery_year}` : '',
    projSpecs.project_type,
    projSpecs.payment_plan,
    projSpecs.finishing_level,
  ].filter(Boolean) as string[];

  const mergedDetails = Array.from(new Set([...cleanDetails, ...synthesized]));

  return {
    id: String(ad.id ?? ''),
    title: ad.title || '',
    price: Number(ad.price || 0),
    currency: ad.currency || 'ل.س',
    location: ad.location || '',
    imageUrl: normalizeAssetUrl(ad.cover_image_url || images[0]?.image_url || images[0]),
    category: ad.category || 'real-estate',
    subcategory: ad.subcategory || ad.sub_category || '',
    isFeatured: Boolean(ad.is_featured),
    date: ad.published_on || ad.created_at || '',
    details: mergedDetails,
    ownerUserId: ad.owner_user_id ? Number(ad.owner_user_id) : undefined,
    ownerPhone: ad.owner_phone,
    whatsappPhone: ad.whatsapp_phone,
    description: ad.description,
    mapUrl: ad.map_url || row.map_url || (mapDetail ? String(mapDetail).replace('map_url:', '') : ''),
    images: images.map((i: any) => normalizeAssetUrl(typeof i === 'string' ? i : i.image_url)).filter(Boolean),
    videos: (row.videos || ad.videos || []).map((v: any) => normalizeAssetUrl(typeof v === 'string' ? v : v.video_url)).filter(Boolean),
    carBrand: specs.brand_name || ad.car_brand || '',
    carModel: specs.model_name || ad.car_model || '',
    carYear: specs.model_year ? String(specs.model_year) : (ad.car_year || ''),
    carGear: specs.transmission || ad.car_gear || '',
    carFuel: specs.fuel_type || ad.car_fuel || '',
    carMileage: specs.mileage ? Number(specs.mileage) : undefined,
    carBodyType: specs.body_type || ad.car_body_type || '',
    carCondition: specs.car_condition || ad.car_condition || '',
    carType: specs.car_type || ad.car_type || ad.purpose || '',
    carColor: specs.color || ad.car_color || '',
    engineSize: specs.engine_size || '',
    enginePower: specs.engine_power || '',
    carDrive: specs.drive_type || '',
    carWarranty: specs.has_warranty || '',
    carAdvertiser: specs.advertiser_type || '',
    propType: reSpecs.property_type || projSpecs.project_type || '',
    reRooms: reSpecs.rooms || '',
    reBaths: reSpecs.bathrooms || '',
    reArea: reSpecs.area_text || (reSpecs.net_area ? `${reSpecs.net_area} م²` : ''),
    reNetArea: reSpecs.net_area ? String(reSpecs.net_area) : '',
    reFloor: reSpecs.floor || '',
    buildingTotalFloors: reSpecs.total_floors || projSpecs.floors_count || '',
    reFurnished: reSpecs.furnished || '',
    reBuildingAge: reSpecs.building_age || '',
    reType: reSpecs.re_type || ad.purpose || '',
    heatingType: reSpecs.heating_type || '',
    titleDeedType: reSpecs.title_deed_type || '',
    propertyDirection: reSpecs.property_direction || '',
    hasElevator: reSpecs.has_elevator || '',
    hasParking: reSpecs.has_parking || '',
    advertiserType: reSpecs.advertiser_type || projSpecs.advertiser_type || '',
  };
}
