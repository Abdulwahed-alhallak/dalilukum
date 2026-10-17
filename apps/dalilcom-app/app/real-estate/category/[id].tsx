import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NativeIcon } from '../../../components/common/NativeIcon';
import { useApp, AdItem } from '../../../context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { EstateCard } from '../../../components/realestate/EstateCard';
import { EstateFiltersSheet } from '../../../components/realestate/EstateFiltersSheet';
import { EstateFilters, applyEstateFilters, initialEstateFilters } from '../../../components/realestate/filterLogic';
import { AppHeaderLogo, BottomBackButton } from '../../../components/common/AppHeader';

export default function CategoryResultsPage() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const { state, getFilteredAds, refresh } = useApp();
  const [filters, setFilters] = useState<EstateFilters>(initialEstateFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const categoryId = id || 'all';
  const pageTitle = title || 'عرض الكل';
  const ads = getFilteredAds({ category: 'real-estate' });
  const filteredAds = applyEstateFilters(ads, categoryId, filters);

  useEffect(() => {
    if (state.ads.length === 0) {
      refresh();
    }
  }, [refresh, state.ads.length]);

  const renderItem = ({ item }: { item: AdItem }) => (
    <EstateCard item={item} onPress={() => router.push(`/details/property/${item.id}` as any)} />
  );

  return (
    <View style={styles.container}>
      <AppHeaderLogo title={pageTitle} />
      <EstateFiltersSheet visible={filterOpen} filters={filters} setFilters={setFilters} onClose={() => setFilterOpen(false)} />
      <FlatList
        data={filteredAds}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <NativeIcon name="options-outline" size={19} color={COLORS.white} />
              <Text style={styles.filterText}>بحث متقدم</Text>
            </TouchableOpacity>
            <View style={styles.resultBadge}>
              <Text style={styles.resultLabel}>النتائج المطابقة</Text>
              <Text style={styles.resultCount}>{filteredAds.length.toLocaleString('ar-SY')} إعلان</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState onReset={() => setFilters(initialEstateFilters)} />}
      />
      <BottomBackButton />
    </View>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.emptyBox}>
      <NativeIcon name="alert-circle-outline" size={38} color={COLORS.primary} />
      <Text style={styles.emptyTitle}>لا توجد نتائج مطابقة</Text>
      <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetText}>تصفير البحث</Text>
      </TouchableOpacity>
    </View>
  );
}

const shadow = { shadowColor: '#0D3B46', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  list: { padding: SPACING.lg, paddingBottom: 170, gap: SPACING.md },
  topBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING.lg, ...shadow },
  filterBtn: { backgroundColor: '#0D3B46', borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, height: 40, flexDirection: 'row-reverse', alignItems: 'center', gap: SPACING.xs },
  filterText: { color: COLORS.white, fontWeight: '900', fontSize: FONT_SIZES.sm },
  resultBadge: { alignItems: 'flex-end' },
  resultLabel: { color: COLORS.gray500, fontSize: FONT_SIZES.xs, fontWeight: '800' },
  resultCount: { color: '#0D3B46', fontSize: FONT_SIZES.md, fontWeight: '900', marginTop: 3 },
  columns: { gap: SPACING.md },
  emptyBox: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl, marginTop: SPACING.lg, ...shadow },
  emptyTitle: { color: COLORS.gray900, fontSize: FONT_SIZES.md, fontWeight: '900', marginTop: SPACING.md },
  resetBtn: { marginTop: SPACING.lg, backgroundColor: 'rgba(246,242,232,0.74)', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.full },
  resetText: { color: '#0D3B46', fontWeight: '900' },
});
