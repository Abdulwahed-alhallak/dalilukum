import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeIcon } from '../../components/common/NativeIcon';
import { useApp, AdItem } from '../../context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const normalizeDigits = (val?: string) => (val || '').replace(/\D/g, '');

export default function ProfileTab() {
  const router = useRouter();
  const { state, loginUser, logoutUser, deleteAd } = useApp();
  const [phoneInput, setPhoneInput] = useState('+963 ');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    const clean = normalizeDigits(phoneInput);
    if (clean.length < 8) {
      Alert.alert('تنبيه', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }
    setLoggingIn(true);
    try {
      await loginUser(phoneInput.trim());
    } finally {
      setLoggingIn(false);
    }
  };

  const normUserPhone = normalizeDigits(state.user?.phone);
  const myAds = state.ads.filter(ad => {
    if (!state.user) return false;
    if (state.user.id && ad.ownerUserId && state.user.id === ad.ownerUserId) return true;
    const normOwner = normalizeDigits(ad.ownerPhone);
    return normUserPhone.length >= 7 && normOwner.length >= 7 && (normOwner.endsWith(normUserPhone.slice(-8)) || normUserPhone.endsWith(normOwner.slice(-8)));
  });

  const confirmDelete = (ad: AdItem) => {
    Alert.alert('حذف الإعلان', 'هل ترغب في حذف هذا الإعلان نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteAd(ad.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <NativeIcon name="chevron-forward" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حسابي وإعلاناتي</Text>
      </View>

      {!state.user ? (
        <View style={styles.content}>
          <View style={styles.avatar}>
            <NativeIcon name="person-outline" size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>تسجيل الدخول في دليلكم</Text>
          <Text style={styles.subtitle}>أدخل رقم هاتفك لإدارة إعلاناتك والمفضلة</Text>
          <TextInput
            value={phoneInput}
            onChangeText={setPhoneInput}
            placeholder="+963 9XX XXX XXX"
            keyboardType="phone-pad"
            style={styles.phoneInput}
          />
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loggingIn}>
            <Text style={styles.loginText}>{loggingIn ? 'جاري الدخول...' : 'تسجيل الدخول'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loggedWrap}>
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.name}>مرحباً بك في دليلكم</Text>
                <Text style={styles.phoneLabel}>{state.user.phone}</Text>
              </View>
              <View style={styles.avatarSmall}>
                <NativeIcon name="person" size={26} color={COLORS.primary} />
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => router.push('/create' as any)}>
                <Text style={styles.actionBtnPrimaryText}>أضف إعلان جديد</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnOutline} onPress={logoutUser}>
                <Text style={styles.actionBtnOutlineText}>تسجيل الخروج</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>إعلاناتي المنشورة ({myAds.length})</Text>
          <FlatList
            data={myAds}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>لا توجد إعلانات مرتبطة برقم هاتفك حالياً.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.adCard}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.adImage} /> : <View style={styles.adImage} />}
                <View style={styles.adBody}>
                  <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.adPrice}>{item.price.toLocaleString('ar-SY')} {item.currency}</Text>
                  <View style={styles.adBtns}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => router.push({ pathname: '/(tabs)/create', params: { editId: item.id } } as any)}
                    >
                      <Text style={styles.editBtnText}>تعديل</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.delBtn} onPress={() => confirmDelete(item)}>
                      <Text style={styles.delBtnText}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 46, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: COLORS.white },
  content: { alignItems: 'center', paddingTop: SPACING.xl, paddingHorizontal: SPACING.xl },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, elevation: 3 },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.gray900, textAlign: 'right' },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, marginTop: SPACING.xs, marginBottom: SPACING.lg, textAlign: 'center' },
  phoneInput: { width: '100%', height: 52, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: '#E3C98D', paddingHorizontal: SPACING.lg, fontSize: FONT_SIZES.md, fontWeight: '800', textAlign: 'left', marginBottom: SPACING.md },
  loginBtn: { width: '100%', height: 52, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  loginText: { color: COLORS.white, fontWeight: '900', fontSize: FONT_SIZES.md },
  loggedWrap: { flex: 1, padding: SPACING.lg },
  userCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, elevation: 3 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: SPACING.md },
  userInfo: { alignItems: 'flex-end' },
  phoneLabel: { fontSize: FONT_SIZES.md, color: '#C9A15A', fontWeight: '800', marginTop: 2 },
  avatarSmall: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.offWhite, alignItems: 'center', justifyContent: 'center' },
  userActions: { flexDirection: 'row-reverse', gap: SPACING.sm, marginTop: SPACING.md },
  actionBtnPrimary: { flex: 1, height: 44, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  actionBtnPrimaryText: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.sm },
  actionBtnOutline: { paddingHorizontal: SPACING.lg, height: 44, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: '#E3C98D', alignItems: 'center', justifyContent: 'center' },
  actionBtnOutlineText: { color: COLORS.primary, fontWeight: '800', fontSize: FONT_SIZES.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.gray900, textAlign: 'right', marginBottom: SPACING.sm },
  listContent: { paddingBottom: 100, gap: SPACING.md },
  emptyBox: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.gray500, fontWeight: '700' },
  adCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.sm, flexDirection: 'row-reverse', gap: SPACING.md, elevation: 2 },
  adImage: { width: 96, height: 84, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.gray200 },
  adBody: { flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' },
  adTitle: { fontSize: FONT_SIZES.md, fontWeight: '900', color: COLORS.gray900 },
  adPrice: { fontSize: FONT_SIZES.sm, fontWeight: '900', color: COLORS.primary },
  adBtns: { flexDirection: 'row-reverse', gap: SPACING.sm },
  editBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 5, borderRadius: BORDER_RADIUS.md },
  editBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  delBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 5, borderRadius: BORDER_RADIUS.md },
  delBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '800' },
});
