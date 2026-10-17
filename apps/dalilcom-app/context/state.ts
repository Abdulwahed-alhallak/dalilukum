import { AppState } from './types';

export const initialState: AppState = {
  ads: [],
  favorites: [],
  notifications: [],
  carBrands: [],
  carModels: [],
  user: null,
  carsEnabled: true,
  loading: false,
  error: null,
};
