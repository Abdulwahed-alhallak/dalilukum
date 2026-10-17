// @ts-nocheck
function matchCarFilters(ad, filters) {
  const text = (ad.title + ' ' + (ad.details || []).join(' ')).toLowerCase();
  if (
    (filters.carBodyType !== 'الكل' && !text.includes(filters.carBodyType.toLowerCase())) ||
    (filters.carCondition !== 'الكل' && !text.includes(filters.carCondition.toLowerCase())) ||
    (filters.enginePower !== 'الكل' && !text.includes(filters.enginePower.toLowerCase()))
  ) {
    return false;
  }
  if (filters.engineSize !== 'الكل') {
    const sizeToken = filters.engineSize.replace('ر', '').replace('CC', '').trim().toLowerCase();
    if (!text.includes(sizeToken)) return false;
  }
  if (
    (filters.carDrive !== 'الكل' && !text.includes(filters.carDrive.toLowerCase())) ||
    (filters.carColor !== 'الكل' && !text.includes(filters.carColor.toLowerCase()))
  ) {
    return false;
  }
  if (filters.carWarranty !== 'الكل') {
    const hasWarranty = text.includes('كفالة') || text.includes('ضمان') || text.includes('مضمونة');
    if ((filters.carWarranty === 'نعم' && !hasWarranty) || (filters.carWarranty === 'لا' && hasWarranty)) {
      return false;
    }
  }
  if (filters.carAdvertiser !== 'الكل') {
    const isOwner = text.includes('مالك') || text.includes('مباشرة') || text.includes('مباشر');
    if ((filters.carAdvertiser === 'المالك' && !isOwner) || (filters.carAdvertiser === 'وسيط' && isOwner)) {
      return false;
    }
  }
  if (filters.onlyWithVideo && !(Boolean(ad.videoUrl) || text.includes('فيديو') || text.includes('مصور'))) {
    return false;
  }
  if (filters.adDateRange !== 'الكل') {
    const daysDiff = (Date.now() - new Date(ad.date).getTime()) / 86400000;
    if (
      (filters.adDateRange === 'اليوم' && daysDiff > 1) ||
      (filters.adDateRange === 'آخر 3 أيام' && daysDiff > 3) ||
      (filters.adDateRange === 'آخر أسبوع' && daysDiff > 7) ||
      (filters.adDateRange === 'آخر شهر' && daysDiff > 30)
    ) {
      return false;
    }
  }
  return !(
    (filters.transmission !== 'الكل' && !text.includes(filters.transmission)) ||
    (filters.fuelType !== 'الكل' && !text.includes(filters.fuelType))
  );
}

function matchRealEstateFilters(ad, filters) {
  const text = (ad.title + ' ' + (ad.details || []).join(' ')).toLowerCase();
  if (filters.propType !== 'الكل') {
    const propLower = filters.propType.toLowerCase();
    let matched = text.includes(propLower);
    if (
      filters.propType === 'شقة' &&
      (text.includes('شقق') || (ad.details || []).some((l) => l.includes('غرف') || l.includes('غرفة')))
    ) {
      matched = true;
    }
    if (filters.propType === 'فيلا' && (text.includes('فلل') || text.includes('قصر'))) matched = true;
    if (filters.propType === 'أرض' && (text.includes('أراضي') || text.includes('قطع') || text.includes('مساحة'))) matched = true;
    if (filters.propType === 'مكتب' && (text.includes('تجاري') || text.includes('عيادة'))) matched = true;
    if (filters.propType === 'محل' && (text.includes('محلات') || text.includes('معرض') || text.includes('مخزن'))) matched = true;
    if (
      filters.propType === 'بناء' &&
      (text.includes('بناء') || text.includes('بناية') || text.includes('أبنية') || text.includes('عمارة') || text.includes('محضر') || text.includes('مبنى'))
    ) {
      matched = true;
    }
    if (
      filters.propType === 'بيت عربي' &&
      (text.includes('عربي') || text.includes('بيوت عربية') || text.includes('بيت عربي') || text.includes('أثري') || text.includes('تراثي') || text.includes('دمشقي') || text.includes('حلب') || text.includes('قديم'))
    ) {
      matched = true;
    }
    if (
      filters.propType === 'مشروع' &&
      (text.includes('مشروع') || text.includes('مشاريع') || text.includes('قيد الإنشاء') || text.includes('قيد التنفيذ') || text.includes('تطوير') || text.includes('مخطط') || text.includes('تسليم'))
    ) {
      matched = true;
    }
    if (!matched) return false;
  }

  if (filters.propType === 'شقة') {
    if (filters.isHotelApt) {
      if (!text.includes('مفروش') && !text.includes('مؤثث') && !text.includes('سياحي') && !text.includes('فندقي') && !text.includes('ايجار')) {
        return false;
      }
      if (filters.minRentPeriod !== 'الكل') {
        const period = filters.minRentPeriod;
        if (
          (period === 'يوم' && !text.includes('يوم') && !text.includes('أيام') && !text.includes('يومي')) ||
          (period === 'أسبوع' && !text.includes('أسبوع') && !text.includes('اسبوع')) ||
          (period === 'شهر' && !text.includes('شهر') && !text.includes('شهري')) ||
          (period === 'سنة' && !text.includes('سنة') && !text.includes('سنوي'))
        ) {
          return false;
        }
      }
    }
    if (filters.aptFurnished !== 'الكل') {
      const isFurnished = text.includes('مفروش') || text.includes('مؤثث');
      if ((filters.aptFurnished === 'مفروش' && !isFurnished) || (filters.aptFurnished === 'غير مفروش' && isFurnished)) {
        return false;
      }
    }
    if (filters.aptFloor !== 'الكل' && !text.includes(filters.aptFloor)) return false;
  }

  let areaNum = ad.areaSize ?? null;
  if (areaNum === null) {
    const areaLine = (ad.details || []).find((n) => n.includes('متر') || n.includes('قدم') || n.includes('م²') || n.includes('مساحة'));
    if (areaLine) {
      const parsed = parseInt(areaLine.replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed)) areaNum = parsed;
    }
  }
  if (
    (filters.minNetArea !== '' && areaNum !== null && areaNum < filters.minNetArea) ||
    (filters.maxNetArea !== '' && areaNum !== null && areaNum > filters.maxNetArea) ||
    (filters.titleDeedType !== 'الكل' && !text.includes(filters.titleDeedType))
  ) {
    return false;
  }

  if (filters.advertiserType !== 'الكل') {
    const isOwner = text.includes('مالك') || text.includes('مباشرة') || text.includes('مباشر') || text.includes('من المالك');
    if ((filters.advertiserType === 'المالك' && !isOwner) || (filters.advertiserType === 'وسيط' && isOwner)) {
      return false;
    }
  }

  if (filters.onlyWithVideo && !(Boolean(ad.videoUrl) || text.includes('فيديو') || text.includes('مصور'))) {
    return false;
  }

  return true;
}

export function applyFiltersAndSort(ads, filters) {
  return [
    ...ads.filter((ad) =>
      filters.category === 'cars'
        ? matchCarFilters(ad, filters)
        : filters.category === 'real-estate'
          ? matchRealEstateFilters(ad, filters)
          : true
    ),
  ].sort((a, b) => {
    const sortBy = filters.sortBy;
    if (sortBy === 'السعر من الأقل للأعلى' || sortBy === 'السعر: من الأقل للأعلى') {
      return a.price - b.price;
    }
    if (sortBy === 'السعر من الأعلى للأقل' || sortBy === 'السعر: من الأعلى للأقل') {
      return b.price - a.price;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
