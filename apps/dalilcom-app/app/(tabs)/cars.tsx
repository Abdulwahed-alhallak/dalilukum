import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeIcon } from '../../components/common/NativeIcon';
import { AppHeaderLogo } from '../../components/common/AppHeader';
import { applyCarFilters, CarFiltersSheet, initialCarFilters } from '../../components/automotive/CarFiltersSheet';
import { useApp } from '../../context/AppContext';
import { listApi } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

type Brand = {
  id: number | string;
  ar_name: string;
  en_name: string;
  ads_count?: number;
  domain?: string;
  icon?: string | null;
  image_url?: string;
  logo_url?: string;
};

type CarModel = {
  brand_id: number | string;
  ar_name: string;
  en_name: string;
};

const logoName = (name: string) => name.toLowerCase().replace(/[\s_.]/g, '-').replace(/-+/g, '-');
const datasetLogo = (brand: Brand) =>
  `https://cdn.jsdelivr.net/gh/filippofg/car-logos-dataset@master/logos/optimized/${logoName(brand.en_name)}.png`;
const faviconLogo = (domain?: string) => domain ? `https://www.google.com/s2/favicons?sz=96&domain=${domain}` : '';

function BrandCard({ brand, count, onPress }: { brand: Brand; count: number; onPress: () => void }) {
  const initialLogo = brand.logo_url || brand.image_url || datasetLogo(brand);
  const [logo, setLogo] = useState(initialLogo);

  useEffect(() => {
    setLogo(initialLogo);
  }, [initialLogo]);

  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.brandCard} onPress={onPress}>
      <View style={styles.logoBox}>
        {logo ? (
          <Image
            source={{ uri: logo }}
            style={styles.logo}
            resizeMode="contain"
            onError={() => {
              const fallback = faviconLogo(brand.domain);
              setLogo(current => current === fallback ? '' : fallback);
            }}
          />
        ) : (
          <NativeIcon name="car-outline" size={25} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.brandAr} numberOfLines={1}>{brand.ar_name}</Text>
      <Text style={styles.brandEn} numberOfLines={1}>{brand.en_name}</Text>
      <Text style={styles.count}>({count.toLocaleString('ar-SY')})</Text>
    </TouchableOpacity>
  );
}

export default function CarsTab() {
  const router = useRouter();
  const { state, getFilteredAds, refresh } = useApp();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [carModelsMap, setCarModelsMap] = useState<Record<string, { ar: string; en: string }[]>>({});
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(initialCarFilters);
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
  const filteredCars = useMemo(() => applyCarFilters(cars, { ...filters, query: query || filters.query }, brandOptions, carModelsMap), [cars, filters, query, brandOptions, carModelsMap]);

  const filteredBrands = useMemo(() => {
    const key = query.trim().toLowerCase();
    if (!key) return brands;
    return brands.filter(brand => `${brand.ar_name} ${brand.en_name}`.toLowerCase().includes(key));
  }, [brands, query]);

  const brandCount = (brand: Brand) => filteredCars.filter(ad =>
    ad.carBrand === brand.ar_name ||
    ad.carBrand === brand.en_name ||
    ad.title.includes(brand.ar_name)
  ).length;

  const open = (params: Record<string, string>) => {
    router.push({ pathname: '/cars/brand/[id]', params } as any);
  };

  return (
    <View style={styles.container}>
      <AppHeaderLogo />
      <CarFiltersSheet
        visible={filterOpen}
        filters={filters}
        brands={brandOptions}
        carModelsMap={carModelsMap}
        setFilters={setFilters}
        onClose={() => setFilterOpen(false)}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <NativeIcon name="search" size={21} color={COLORS.gray400} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن ماركة أو موديل..."
            placeholderTextColor={COLORS.gray400}
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity activeOpacity={0.86} style={styles.filterButton} onPress={() => setFilterOpen(true)}>
          <NativeIcon name="options-outline" size={20} color={COLORS.white} />
          <Text style={styles.filterButtonText}>بحث متقدم</Text>
          <Text style={styles.filterCount}>{filteredCars.length.toLocaleString('ar-SY')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.allRow}
          onPress={() => open({ id: 'all', title: 'كل إعلانات السيارات' })}
        >
          <NativeIcon name="chevron-back" size={20} color={COLORS.gray400} />
          <Text style={styles.allCount}>({filteredCars.length.toLocaleString('ar-SY')})</Text>
          <Text style={styles.allTitle}>كل إعلانات السيارات</Text>
        </TouchableOpacity>

        <View style={styles.brandGrid}>
          {filteredBrands.map(brand => (
            <BrandCard
              key={String(brand.id)}
              brand={brand}
              count={brandCount(brand)}
              onPress={() => open({ id: String(brand.en_name), title: brand.ar_name, brandAr: brand.ar_name })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const shadow = { shadowColor: '#0D3B46', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: SPACING.lg, paddingBottom: 112 },
  searchBox: { height: 58, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray100, ...shadow },
  searchInput: { flex: 1, textAlign: 'right', fontSize: FONT_SIZES.md, color: COLORS.gray900, paddingVertical: 0 },
  filterButton: { height: 52, backgroundColor: '#0D3B46', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, ...shadow },
  filterButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '900' },
  filterCount: { minWidth: 32, textAlign: 'center', color: '#0D3B46', backgroundColor: '#C9A15A', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, fontWeight: '900' },
  allRow: { minHeight: 72, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray100, ...shadow },
  allCount: { color: COLORS.gray500, fontSize: FONT_SIZES.md, fontWeight: '900', marginHorizontal: SPACING.sm },
  allTitle: { flex: 1, textAlign: 'right', fontSize: 18, fontWeight: '900', color: COLORS.gray900 },
  brandGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: SPACING.md },
  brandCard: { width: '31.3%', minHeight: 142, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.sm, alignItems: 'center', justifyContent: 'center', ...shadow },
  logoBox: { width: 52, height: 42, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  logo: { width: 48, height: 38 },
  brandAr: { maxWidth: '100%', textAlign: 'center', color: COLORS.gray900, fontSize: FONT_SIZES.sm, fontWeight: '900' },
  brandEn: { maxWidth: '100%', textAlign: 'center', color: COLORS.gray500, fontSize: FONT_SIZES.xs, marginTop: 3 },
  count: { color: COLORS.gray500, fontSize: FONT_SIZES.xs, fontWeight: '900', marginTop: 7 },
});
