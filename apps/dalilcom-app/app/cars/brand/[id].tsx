import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeaderLogo, BottomBackButton } from '../../../components/common/AppHeader';
import { CarFiltersSheet, applyCarFilters, initialCarFilters } from '../../../components/automotive/CarFiltersSheet';
import { EstateCard } from '../../../components/realestate/EstateCard';
import { NativeIcon } from '../../../components/common/NativeIcon';
import { useApp, AdItem } from '../../../context/AppContext';
import { listApi } from '../../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';

type Brand = {
  id: number | string;
  ar_name: string;
  en_name: string;
};

type CarModel = {
  brand_id: number | string;
  ar_name: string;
  en_name: string;
};

const isRent = (ad: AdItem) => `${ad.title} ${ad.details.join(' ')} ${ad.currency}`.includes('إيجار');

export default function CarResultsPage() {
  const router = useRouter();
  const { id, title, brandAr } = useLocalSearchParams<{ id: string; title?: string; brandAr?: string }>();
  const { state, getFilteredAds, refresh } = useApp();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(initialCarFilters);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [carModelsMap, setCarModelsMap] = useState<Record<string, { ar: string; en: string }[]>>({});
  const cars = getFilteredAds({ category: 'cars' });

  useEffect(() => {
    let mounted = true;
    async function loadCarsData() {
      const [brandRows, modelRows] = await Promise.all([
        listApi<Brand>('/car-brands', { per_page: '200' }).catch(() => []),
        listApi<CarModel>('/car-models', { per_page: '1000' }).catch(() => []),
      ]);
      if (!mounted) return;
      if (brandRows.length > 0) {
        setBrands(brandRows);
      } else if (state.carBrands.length > 0) {
        setBrands(
          state.carBrands.map((b, idx) => ({
            id: b.id ?? idx + 1,
            ar_name: b.ar,
            en_name: b.en,
          })),
        );
      }
      if (modelRows.length > 0 && brandRows.length > 0) {
        const models = modelRows.reduce<Record<string, { ar: string; en: string }[]>>((acc, row) => {
          const brand = brandRows.find(item => String(item.id) === String(row.brand_id));
          if (brand) acc[brand.en_name] = [...(acc[brand.en_name] || []), { ar: row.ar_name, en: row.en_name }];
          return acc;
        }, {});
        setCarModelsMap(models);
      } else if (state.carModels.length > 0) {
        const models = state.carModels.reduce<Record<string, { ar: string; en: string }[]>>((acc, row) => {
          if (row.brandEn) {
            acc[row.brandEn] = [...(acc[row.brandEn] || []), { ar: row.ar, en: row.en }];
          }
          return acc;
        }, {});
        setCarModelsMap(models);
      }
    }

    loadCarsData();
    if (state.ads.length === 0) {
      refresh();
    }
    return () => {
      mounted = false;
    };
  }, [refresh, state.ads.length, state.carBrands, state.carModels]);

  const brandOptions = useMemo(() => brands.map(brand => ({ ar: brand.ar_name, en: brand.en_name })), [brands]);

  const routeFiltered = useMemo(() => cars.filter(ad => {
    if (id === 'all') return true;
    if (id === 'sale') return !isRent(ad);
    if (id === 'rent') return isRent(ad);
    const key = String(id || '').toLowerCase();
    return (ad.carBrand || '').toLowerCase() === key || ad.carBrand === brandAr || ad.title.includes(brandAr || '');
  }), [cars, id, brandAr]);

  const filtered = useMemo(
    () => applyCarFilters(routeFiltered, filters, brandOptions, carModelsMap),
    [routeFiltered, filters, brandOptions, carModelsMap],
  );

  const renderItem = ({ item }: { item: AdItem }) => (
    <EstateCard item={item} compact onPress={() => router.push(`/details/car/${item.id}` as any)} />
  );

  return (
    <View style={styles.container}>
      <AppHeaderLogo title={title || 'السيارات'} />
      <CarFiltersSheet
        visible={filterOpen}
        filters={filters}
        brands={brandOptions}
        carModelsMap={carModelsMap}
        setFilters={setFilters}
        onClose={() => setFilterOpen(false)}
      />
      <FlatList
        data={filtered}
        key="cars-grid-3"
        numColumns={3}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <View>
            <TouchableOpacity activeOpacity={0.86} style={styles.filterButton} onPress={() => setFilterOpen(true)}>
              <NativeIcon name="options-outline" size={20} color={COLORS.white} />
              <Text style={styles.filterButtonText}>بحث متقدم</Text>
              <Text style={styles.filterCount}>{filtered.length.toLocaleString('ar-SY')}</Text>
            </TouchableOpacity>
            <View style={styles.topBar}>
              <View style={styles.icon}><NativeIcon name="car" size={23} color={COLORS.white} /></View>
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>النتائج المطابقة</Text>
                <Text style={styles.resultCount}>{filtered.length.toLocaleString('ar-SY')} إعلان</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyBox}>
            <NativeIcon name="alert-circle-outline" size={38} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>لا توجد سيارات مطابقة حاليا</Text>
          </View>
        )}
      />
      <BottomBackButton />
    </View>
  );
}

const shadow = { shadowColor: '#0D3B46', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  list: { padding: SPACING.md, paddingBottom: 170, gap: SPACING.sm },
  columns: { gap: SPACING.sm },
  filterButton: { height: 52, backgroundColor: '#0D3B46', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, ...shadow },
  filterButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '900' },
  filterCount: { minWidth: 32, textAlign: 'center', color: '#0D3B46', backgroundColor: '#C9A15A', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, fontWeight: '900' },
  topBar: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING.lg, ...shadow },
  icon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C9A15A', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.md },
  resultBox: { flex: 1, alignItems: 'flex-end' },
  resultLabel: { color: COLORS.gray500, fontSize: FONT_SIZES.xs, fontWeight: '800' },
  resultCount: { color: '#0D3B46', fontSize: FONT_SIZES.md, fontWeight: '900', marginTop: 3 },
  emptyBox: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl, marginTop: SPACING.lg, ...shadow },
  emptyTitle: { color: COLORS.gray900, fontSize: FONT_SIZES.md, fontWeight: '900', marginTop: SPACING.md },
});
