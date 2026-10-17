export type Category = 'real-estate' | 'cars';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type?: string;
}

export interface CarBrandItem {
  id?: number;
  ar: string;
  en: string;
  count?: number;
}

export interface CarModelItem {
  id?: number;
  brandEn: string;
  ar: string;
  en: string;
  count?: number;
}

export interface UserSession {
  id?: number;
  phone: string;
}

export interface AdItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  imageUrl: string;
  category: Category;
  subcategory?: string;
  isFeatured: boolean;
  date: string;
  details: string[];
  ownerUserId?: number;
  ownerPhone?: string;
  whatsappPhone?: string;
  description?: string;
  mapUrl?: string;
  images?: string[];
  videos?: string[];
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
  reFloor?: string;
  buildingTotalFloors?: string | number;
  reFurnished?: string;
  reBuildingAge?: string;
  reType?: string;
  heatingType?: string;
  titleDeedType?: string;
  propertyDirection?: string;
  hasElevator?: string;
  hasParking?: string;
  advertiserType?: string;
}

export interface AppState {
  ads: AdItem[];
  favorites: string[];
  notifications: NotificationItem[];
  carBrands: CarBrandItem[];
  carModels: CarModelItem[];
  user: UserSession | null;
  carsEnabled: boolean;
  loading: boolean;
  error: string | null;
}
