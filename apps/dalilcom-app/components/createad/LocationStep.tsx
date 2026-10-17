import React, { useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Field, Choice, ChoiceWrap } from './Controls';
import { CreateAdForm } from './data';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants/theme';

const cities = ['دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'إدلب', 'الرقة', 'دير الزور', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة'];

type Props = {
  form: CreateAdForm;
  setField: (key: keyof CreateAdForm, value: string) => void;
};

export function LocationStep({ form, setField }: Props) {
  const [locating, setLocating] = useState(false);

  const openMap = () => {
    const query = `${form.city} ${form.neighborhood}`.trim();
    const url = form.mapUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url).catch(() => Alert.alert('تنبيه', 'تعذر فتح تطبيق الخرائط'));
  };

  const usePreciseLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('إذن الموقع مطلوب', 'فعّل إذن الموقع حتى نقدر نحفظ مكان الإعلان بدقة.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => Location.getLastKnownPositionAsync());

      if (!current?.coords) {
        Alert.alert('تعذر تحديد الموقع', 'تأكد من تشغيل GPS والإنترنت ثم حاول مرة ثانية.');
        return;
      }

      const { latitude, longitude } = current.coords;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      setField('mapUrl', mapUrl);
      Alert.alert('تم تحديد الموقع', 'تم حفظ موقعك الحالي بدقة داخل الإعلان.');
    } catch {
      Alert.alert('تعذر تحديد الموقع', 'تأكد من تشغيل GPS والإنترنت ثم حاول مرة ثانية.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View>
      <ChoiceWrap>
        {cities.map(city => (
          <Choice key={city} label={city} active={form.city === city} onPress={() => setField('city', city)} />
        ))}
      </ChoiceWrap>
      <Field
        label="الحي أو العنوان التفصيلي"
        value={form.neighborhood}
        onChangeText={value => setField('neighborhood', value)}
        placeholder="مثال: المزة، قرب الجامعة"
      />
      <Field
        label="رابط الموقع على الخريطة"
        value={form.mapUrl}
        onChangeText={value => setField('mapUrl', value)}
        placeholder="الصق رابط Google Maps هنا"
      />
      <TouchableOpacity activeOpacity={0.86} style={styles.preciseButton} disabled={locating} onPress={usePreciseLocation}>
        <Text style={styles.preciseText}>{locating ? 'جاري تحديد الموقع...' : 'تحديد موقعي بدقة عبر GPS'}</Text>
        <Text style={styles.preciseHint}>يحفظ نقطة الموقع الدقيقة بدل المنطقة العامة</Text>
      </TouchableOpacity>
      <ChoiceWrap>
        <Choice label="فتح الموقع على الخريطة" active onPress={openMap} />
      </ChoiceWrap>
    </View>
  );
}

const styles = StyleSheet.create({
  preciseButton: {
    minHeight: 62,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  preciseText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '900', textAlign: 'center' },
  preciseHint: { color: COLORS.gold, fontSize: FONT_SIZES.xs, fontWeight: '800', marginTop: 4, textAlign: 'center' },
});
