export type Category = 'real-estate' | 'cars';

export interface AdItem {
  id: string;
  ownerUserId?: number | string;
  title: string;
  price: number;
  currency: string;
  location: string;
  category: Category;
  imageUrl: string;
  isFeatured: boolean;
  date: string;
  details: string[];
  imageUrls?: string[];
  videoUrl?: string;
  ownerPhone?: string;
  whatsappPhone?: string;
  mapUrl?: string;
  description?: string;
  // Structured classification fields for filtering
  subCategory?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  carGear?: string;
  carFuel?: string;
  carMileage?: number;
  carBodyType?: string;
  carCondition?: string;
  carType?: string;
  carColor?: string;
  engineSize?: string;
  enginePower?: string;
  carDrive?: string;
  carWarranty?: string;
  carAdvertiser?: string;
  propType?: string;
  reRooms?: string;
  reBaths?: string;
  reArea?: string;
  reNetArea?: string;
  reType?: string;
  reFloor?: string;
  reFurnished?: string;
  reBuildingAge?: string;
  buildingTotalFloors?: string | number;
  heatingType?: string;
  hasElevator?: string;
  hasParking?: string;
  titleDeedType?: string;
  propertyDirection?: string;
  advertiserType?: string;
  rooms?: number;
  bathrooms?: number;
  areaSize?: number;
  purpose?: string;

  // Real estate project specific fields
  projectStatus?: string;
  deliveryYear?: string;
  projectFloors?: number | '';
  projectType?: string;
  projectFinishing?: string;
  projectLandArea?: number | '';
  projectUnitsCount?: number | '';
  paymentPlan?: string;
  projectFacilities?: string[];
  projectAmenities?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  isRead: boolean;
}

export interface User {
  id?: number;
  phone: string;
  countryId?: number;
  isLoggedIn: boolean;
}
