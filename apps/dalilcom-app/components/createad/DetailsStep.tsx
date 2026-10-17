import React from 'react';
import { View } from 'react-native';
import { Field, Choice, ChoiceWrap, SelectField } from './Controls';
import { CreateAdForm } from './data';
import { useApp } from '../../context/AppContext';

type Props = {
  form: CreateAdForm;
  setField: (key: keyof CreateAdForm, value: string) => void;
};

const purposes = ['للبيع', 'للإيجار'];
const gears = ['أوتوماتيك', 'عادي'];
const fuels = ['بنزين', 'ديزل', 'كهرباء', 'هجين'];
const roomOptions = ['استوديو / غرفة واحدة', '2 غرف', '3 غرف', '4 غرف', '5 غرف أو أكثر'];
const bathOptions = ['1 حمام', '2 حمام', '3 حمامات أو أكثر'];
const furnishedOptions = ['غير مفروش', 'مفروش بالكامل', 'شبه مفروش'];
const ageOptions = ['جديد / صفر', '1-5 سنوات', '5-10 سنوات', 'قديم مخدم'];
const yesNoOptions = ['اختياري', 'نعم', 'لا'];
const advertiserOptions = ['اختياري', 'المالك', 'وسيط', 'مكتب عقاري'];
const commercialTypeOptions = ['محل تجاري رئيسي', 'مكتب', 'عيادة', 'مستودع', 'صالة عرض', 'مطعم / كافيه'];
const commercialLicenseOptions = ['اختياري', 'مرخص تجاري', 'قابل للترخيص', 'غير مرخص'];
const commercialFitOutOptions = ['اختياري', 'جاهز للعمل', 'نصف تجهيز', 'على العظم', 'بحاجة صيانة'];

export function DetailsStep({ form, setField }: Props) {
  const set = (key: keyof CreateAdForm) => (value: string) => setField(key, value);
  return (
    <View>
      <Field label="عنوان الإعلان" value={form.title} onChangeText={set('title')} placeholder="مثال: شقة مفروشة أو سيارة للبيع" />
      <Field label="وصف الإعلان" value={form.description} onChangeText={set('description')} placeholder="اكتب وصف واضح..." multiline />
      {form.category === 'cars' ? <CarFields form={form} setField={setField} /> : form.subcategory === 'مشاريع عقارية قيد التنفيذ'
        ? <ProjectFields form={form} setField={setField} />
        : form.subcategory === 'المحلات التجارية'
          ? <CommercialFields form={form} setField={setField} />
        : <RealEstateFields form={form} setField={setField} />}
    </View>
  );
}

function CommercialFields({ form, setField }: Props) {
  const set = (key: keyof CreateAdForm) => (value: string) => setField(key, value);
  const setOptional = (key: keyof CreateAdForm) => (value: string) => setField(key, value === 'اختياري' ? '' : value);
  return (
    <View>
      <ChoiceWrap>{purposes.map(v => <Choice key={v} label={v} active={form.reType === v} onPress={() => setField('reType', v)} />)}</ChoiceWrap>
      <SelectField label="نوع العقار التجاري" value={form.commercialType} options={commercialTypeOptions} onChange={set('commercialType')} />
      <Field label="المساحة" value={form.area} onChangeText={set('area')} placeholder="مثال: 80 متر مربع" />
      <Field label="الطابق / مستوى المحل" value={form.floor} onChangeText={set('floor')} placeholder="مثال: أرضي، طابق أول، قبو" />
      <Field label="عرض الواجهة" value={form.commercialFrontage} onChangeText={set('commercialFrontage')} placeholder="مثال: واجهة 6 متر على الشارع" />
      <SelectField label="الترخيص" value={form.commercialLicense} options={commercialLicenseOptions} onChange={setOptional('commercialLicense')} />
      <SelectField label="التجهيز" value={form.commercialFitOut} options={commercialFitOutOptions} onChange={setOptional('commercialFitOut')} />
      <Field label="نوع التدفئة / الطاقة" value={form.heatingType} onChangeText={set('heatingType')} placeholder="اختياري: كهرباء، مولدة، طاقة شمسية" />
      <SelectField label="موقف سيارات" value={form.hasParking} options={yesNoOptions} onChange={setOptional('hasParking')} />
      <SelectField label="نوع المعلن" value={form.advertiserType} options={advertiserOptions} onChange={setOptional('advertiserType')} />
    </View>
  );
}

function RealEstateFields({ form, setField }: Props) {
  const set = (key: keyof CreateAdForm) => (value: string) => setField(key, value);
  const setOptional = (key: keyof CreateAdForm) => (value: string) => setField(key, value === 'اختياري' ? '' : value);
  return (
    <View>
      <ChoiceWrap>{purposes.map(v => <Choice key={v} label={v} active={form.reType === v} onPress={() => setField('reType', v)} />)}</ChoiceWrap>
      <SelectField label="عدد الغرف" value={form.rooms} options={roomOptions} onChange={set('rooms')} />
      <SelectField label="عدد الحمامات" value={form.baths} options={bathOptions} onChange={set('baths')} />
      <Field label="المساحة" value={form.area} onChangeText={set('area')} />
      <Field label="الطابق" value={form.floor} onChangeText={set('floor')} />
      <Field label="عدد طوابق البناء" value={form.buildingTotalFloors} onChangeText={set('buildingTotalFloors')} keyboardType="numeric" />
      <SelectField label="الفرش" value={form.furnished} options={furnishedOptions} onChange={set('furnished')} />
      <SelectField label="عمر البناء" value={form.age} options={ageOptions} onChange={set('age')} />
      <Field label="نوع التدفئة" value={form.heatingType} onChangeText={set('heatingType')} />
      <Field label="الطابو / الملكية" value={form.titleDeedType} onChangeText={set('titleDeedType')} />
      <Field label="الاتجاه / الإطلالة" value={form.propertyDirection} onChangeText={set('propertyDirection')} />
      <SelectField label="مصعد" value={form.hasElevator} options={yesNoOptions} onChange={setOptional('hasElevator')} />
      <SelectField label="موقف سيارات" value={form.hasParking} options={yesNoOptions} onChange={setOptional('hasParking')} />
      <SelectField label="نوع المعلن" value={form.advertiserType} options={advertiserOptions} onChange={setOptional('advertiserType')} />
    </View>
  );
}

function CarFields({ form, setField }: Props) {
  const { state } = useApp();
  const set = (key: keyof CreateAdForm) => (value: string) => setField(key, value);
  const brandOptions = state.carBrands.map(b => b.ar).filter(Boolean);
  const effectiveBrand = form.carBrand || brandOptions[0] || '';
  const selectedBrandEn = state.carBrands.find(b => b.ar === effectiveBrand || b.en === effectiveBrand)?.en;
  const modelOptions = selectedBrandEn
    ? state.carModels.filter(m => m.brandEn.toLowerCase() === selectedBrandEn.toLowerCase()).map(m => m.ar).filter(Boolean)
    : [];

  React.useEffect(() => {
    if (!form.carBrand && brandOptions.length > 0) {
      setField('carBrand', brandOptions[0]);
    }
  }, [form.carBrand, brandOptions, setField]);

  React.useEffect(() => {
    if (!form.carModel && modelOptions.length > 0) {
      setField('carModel', modelOptions[0]);
    }
  }, [form.carModel, modelOptions, setField]);

  return (
    <View>
      <ChoiceWrap>{purposes.map(v => <Choice key={v} label={v} active={form.carType === v} onPress={() => setField('carType', v)} />)}</ChoiceWrap>
      {brandOptions.length > 0 ? (
        <SelectField
          label="الماركة"
          value={form.carBrand || brandOptions[0]}
          options={brandOptions}
          onChange={(val) => {
            setField('carBrand', val);
            setField('carModel', '');
          }}
        />
      ) : (
        <Field label="الماركة" value={form.carBrand} onChangeText={set('carBrand')} placeholder="مثال: تويوتا" />
      )}
      {modelOptions.length > 0 ? (
        <SelectField
          label="الموديل"
          value={form.carModel || modelOptions[0]}
          options={modelOptions}
          onChange={set('carModel')}
        />
      ) : (
        <Field label="الموديل" value={form.carModel} onChangeText={set('carModel')} placeholder="مثال: كورولا" />
      )}
      <Field label="سنة الصنع" value={form.carYear} onChangeText={set('carYear')} keyboardType="numeric" />
      <ChoiceWrap>{gears.map(v => <Choice key={v} label={v} active={form.carGear === v} onPress={() => setField('carGear', v)} />)}</ChoiceWrap>
      <ChoiceWrap>{fuels.map(v => <Choice key={v} label={v} active={form.carFuel === v} onPress={() => setField('carFuel', v)} />)}</ChoiceWrap>
      <Field label="الممشى بالكيلومتر" value={form.carMileage} onChangeText={set('carMileage')} keyboardType="numeric" />
      <Field label="نوع الهيكل" value={form.carBodyType} onChangeText={set('carBodyType')} placeholder="سيدان، SUV، بيك أب" />
      <Field label="الحالة" value={form.carCondition} onChangeText={set('carCondition')} />
      <Field label="اللون" value={form.carColor} onChangeText={set('carColor')} />
      <Field label="حجم المحرك" value={form.engineSize} onChangeText={set('engineSize')} placeholder="مثال: 1600 CC" />
      <Field label="قوة المحرك" value={form.enginePower} onChangeText={set('enginePower')} placeholder="مثال: 4 سلندر / اقتصادي" />
      <Field label="نظام الدفع" value={form.carDrive} onChangeText={set('carDrive')} placeholder="أمامي / خلفي / رباعي" />
      <Field label="الضمان" value={form.carWarranty} onChangeText={set('carWarranty')} placeholder="نعم / لا" />
      <Field label="نوع المعلن" value={form.carAdvertiser} onChangeText={set('carAdvertiser')} placeholder="المالك / معرض / وسيط" />
    </View>
  );
}

function ProjectFields({ form, setField }: Props) {
  const set = (key: keyof CreateAdForm) => (value: string) => setField(key, value);
  return (
    <View>
      <Field label="حالة المشروع" value={form.projectStatus} onChangeText={set('projectStatus')} />
      <Field label="سنة التسليم" value={form.deliveryYear} onChangeText={set('deliveryYear')} keyboardType="numeric" />
      <Field label="عدد الطوابق" value={form.projectFloors} onChangeText={set('projectFloors')} keyboardType="numeric" />
      <Field label="نوع المشروع" value={form.projectType} onChangeText={set('projectType')} />
      <Field label="خطة السداد" value={form.paymentPlan} onChangeText={set('paymentPlan')} />
      <Field label="الإكساء" value={form.projectFinishing} onChangeText={set('projectFinishing')} />
      <Field label="مساحة الأرض" value={form.projectLandArea} onChangeText={set('projectLandArea')} keyboardType="numeric" />
      <Field label="عدد الوحدات" value={form.projectUnitsCount} onChangeText={set('projectUnitsCount')} keyboardType="numeric" />
    </View>
  );
}
