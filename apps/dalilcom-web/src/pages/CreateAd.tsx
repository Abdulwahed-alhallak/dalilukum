import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAds } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import { CarInputs } from '../components/createad/CarInputs';
import { RealEstateInputs } from '../components/createad/RealEstateInputs';
import { ProjectInputs } from '../components/createad/ProjectInputs';
import { MediaSelector } from '../components/createad/MediaSelector';
import { SuccessReport } from '../components/createad/SuccessReport';
import { StepCategorySelector } from '../components/createad/StepCategorySelector';
import { StepLocation } from '../components/createad/StepLocation';
import { StepPrice } from '../components/createad/StepPrice';
import { StepperHeader } from '../components/createad/StepperHeader';
import {
  steps,
  PRESET_CAR_IMAGES,
  PRESET_HOME_IMAGES,
} from '../components/createad/presetData';

export function CreateAdPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ads, addAd, userLimits, defaultLimits } = useAds();

  const userPhone = user?.phone || '';
  const customLimits = userPhone ? userLimits[userPhone] : null;
  const maxImages = customLimits ? customLimits.maxImages : defaultLimits.maxImages;
  const maxVideos = customLimits ? customLimits.maxVideos : defaultLimits.maxVideos;
  const maxAds = customLimits ? customLimits.maxAds : defaultLimits.maxAds;

  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState<'cars' | 'real-estate'>('real-estate');
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Car specs
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('2024');
  const [carGear, setCarGear] = useState('أوتوماتيك');
  const [carFuel, setCarFuel] = useState('بنزين');
  const [carMileage, setCarMileage] = useState('0');
  const [carBodyType, setCarBodyType] = useState('سيدان');
  const [carCondition, setCarCondition] = useState('مستعمل نظيف');
  const [carColor, setCarColor] = useState('');
  const [carType, setCarType] = useState('للبيع');
  const [engineSizeState, setEngineSizeState] = useState('');
  const [enginePowerState, setEnginePowerState] = useState('');
  const [carDriveState, setCarDriveState] = useState('');
  const [carWarrantyState, setCarWarrantyState] = useState('');
  const [carAdvertiserState, setCarAdvertiserState] = useState('');

  // Real estate specs
  const [reRooms, setReRooms] = useState('3 غرف');
  const [reBaths, setReBaths] = useState('2 حمام');
  const [reArea, setReArea] = useState('');
  const [reType, setReType] = useState('للبيع');
  const [reFloor, setReFloor] = useState('الطابق الأول');
  const [reFurnished, setReFurnished] = useState('غير مفروش');
  const [reBuildingAge, setReBuildingAge] = useState('جديد / صفر');
  const [buildingTotalFloorsState, setBuildingTotalFloorsState] = useState('');
  const [heatingTypeState, setHeatingTypeState] = useState('');
  const [hasElevatorState, setHasElevatorState] = useState('');
  const [hasParkingState, setHasParkingState] = useState('');
  const [titleDeedTypeState, setTitleDeedTypeState] = useState('');
  const [propertyDirectionState, setPropertyDirectionState] = useState('');
  const [advertiserTypeState, setAdvertiserTypeState] = useState('');

  // Project specs
  const [projectStatus, setProjectStatus] = useState('تحت الأرض / حفر وتأسيس');
  const [deliveryYear, setDeliveryYear] = useState('2026');
  const [projectFloors, setProjectFloors] = useState<number | ''>('');
  const [projectFinishing, setProjectFinishing] = useState('على العضم');
  const [projectLandArea, setProjectLandArea] = useState<number | ''>('');
  const [projectUnitsCount, setProjectUnitsCount] = useState<number | ''>('');
  const [projectTypeState, setProjectTypeState] = useState('سكني');
  const [paymentPlanState, setPaymentPlanState] = useState('');
  const [projectFacilitiesState, setProjectFacilitiesState] = useState<string[]>([]);
  const [projectAmenitiesState, setProjectAmenitiesState] = useState<string[]>([]);

  // Location & Media & Price
  const [selectedCity, setSelectedCity] = useState('دمشق');
  const [neighborhood, setNeighborhood] = useState('');
  const [mapUrlState, setMapUrlState] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('ل.س');
  const [ownerPhoneState, setOwnerPhoneState] = useState(userPhone);
  const [whatsappPhoneState, setWhatsappPhoneState] = useState(userPhone);

  const handleNext = async () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!subCategory) {
        setErrorMsg('الرجاء اختيار القسم الفرعي للمتابعة');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!title.trim() || !description.trim()) {
        setErrorMsg('الرجاء ملء عنوان الإعلان ووصف المنتج الكافي للمشترين');
        return;
      }
      if (category === 'cars' && (!carBrand.trim() || !carModel.trim())) {
        setErrorMsg('الرجاء اختيار الماركة والموديل للمركبة');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!neighborhood.trim()) {
        setErrorMsg('يرجى تحديد اسم الحي أو موقع العقار/المركبة لعرضه للزبائن');
        return;
      }
      setStep(4);
      return;
    }
    if (step === 4) {
      if (imageUrls.length === 0) {
        setErrorMsg('يرجى اختيار أو رفع صورة واحدة على الأقل لعرض الإعلان');
        return;
      }
      setStep(5);
      return;
    }
    if (step === 5) {
      if (!price || Number(price) <= 0) {
        setErrorMsg('الرجاء تحديد السعر المطلوب بدقة لمتابعة نشر الإعلان');
        return;
      }
      const targetPhone = ownerPhoneState.trim() || userPhone;
      if (targetPhone && maxAds > 0) {
        const currentAdsForPhone = ads.filter(
          a => a.ownerPhone === targetPhone || (user?.id && a.ownerUserId === user.id)
        ).length;
        const limitForPhone = userLimits[targetPhone]?.maxAds ?? maxAds;
        if (currentAdsForPhone >= limitForPhone) {
          setErrorMsg(`لقد وصلت للحد الأقصى المسموح به من الإعلانات (${limitForPhone} إعلانات).`);
          return;
        }
      }
      setSubmitting(true);
      try {
        await addAd({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          currency: currency === 'دولار' ? 'دولار' : 'ل.س',
          location: `${selectedCity}، ${neighborhood.trim()}`,
          category,
          subCategory,
          image: imageUrl || imageUrls[0] || '',
          mapUrl: mapUrlState.trim() || '',
          images: imageUrls,
          videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
          ownerPhone: ownerPhoneState.trim() || userPhone,
          whatsappPhone: whatsappPhoneState.trim() || ownerPhoneState.trim() || userPhone,
          specs:
            category === 'cars'
              ? {
                  brand: carBrand,
                  model: carModel,
                  year: Number(carYear) || 2024,
                  gear: carGear,
                  fuel: carFuel,
                  carMileage: Number(carMileage) || 0,
                  carBodyType,
                  carCondition,
                  carType,
                  carColor,
                  engineSize: engineSizeState,
                  enginePower: enginePowerState,
                  carDrive: carDriveState,
                  carWarranty: carWarrantyState,
                  carAdvertiser: carAdvertiserState,
                }
              : subCategory === 'مشاريع عقارية قيد التنفيذ'
                ? {
                    propType: 'مشروع',
                    projectStatus,
                    deliveryYear,
                    projectFloors: projectFloors !== '' ? Number(projectFloors) : undefined,
                    projectType: projectTypeState,
                    paymentPlan: paymentPlanState,
                    projectFinishing,
                    projectLandArea: projectLandArea !== '' ? Number(projectLandArea) : undefined,
                    projectUnitsCount: projectUnitsCount !== '' ? Number(projectUnitsCount) : undefined,
                    projectFacilities: projectFacilitiesState,
                    projectAmenities: projectAmenitiesState,
                    advertiserType: advertiserTypeState,
                  }
                : {
                    propType:
                      subCategory === 'فلل ومزارع نزهة'
                        ? 'فيلا'
                        : subCategory === 'أراضي للبيع'
                          ? 'أرض'
                          : 'شقة',
                    reRooms,
                    reBaths,
                    reArea,
                    reFloor,
                    buildingTotalFloors: buildingTotalFloorsState,
                    reFurnished,
                    reBuildingAge,
                    reType,
                    heatingType: heatingTypeState,
                    titleDeedType: titleDeedTypeState,
                    propertyDirection: propertyDirectionState,
                    hasElevator: hasElevatorState,
                    hasParking: hasParkingState,
                    advertiserType: advertiserTypeState,
                  },
        });
        setStep(6);
      } catch (err) {
        setErrorMsg('حدث خطأ أثناء حفظ الإعلان، يرجى المحاولة مرة أخرى');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none" dir="rtl">
      <StepperHeader currentStep={step} steps={steps} />

      <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24 text-right">
        {errorMsg && (
          <div className="bg-rose-50 text-rose-800 border-r-4 border-rose-500 p-4 rounded-xl flex items-center gap-2 justify-between">
            <span className="text-xs font-bold">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-xs font-black">✕</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <StepCategorySelector
                category={category}
                setCategory={(cat) => {
                  setCategory(cat as 'cars' | 'real-estate');
                  setSubCategory('');
                }}
                subCategory={subCategory}
                setSubCategory={setSubCategory}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white p-5 rounded-3xl border border-gray-150 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750">عنوان الإعلان الأساسي *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: شقة سوبر ديلوكس مفروشة في مشروع دمر"
                    className="w-full h-11 px-3 border border-gray-200 bg-slate-50 focus:bg-white rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750">وصف السلعة وتفاصيل الحالة *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب أدق تفاصيل العقار أو السيارة لنيل ثقة المشتري..."
                    className="w-full h-24 p-3 border border-gray-200 bg-slate-50 focus:bg-white rounded-xl text-xs font-bold outline-none resize-none"
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-150">
                {category === 'cars' ? (
                  <CarInputs
                    carBrand={carBrand}
                    setCarBrand={setCarBrand}
                    carModel={carModel}
                    setCarModel={setCarModel}
                    carYear={carYear}
                    setCarYear={setCarYear}
                    carGear={carGear}
                    setCarGear={setCarGear}
                    carFuel={carFuel}
                    setCarFuel={setCarFuel}
                    carMileage={carMileage}
                    setCarMileage={setCarMileage}
                    carBodyType={carBodyType}
                    setCarBodyType={setCarBodyType}
                    carCondition={carCondition}
                    setCarCondition={setCarCondition}
                    carColor={carColor}
                    setCarColor={setCarColor}
                    carType={carType}
                    setCarType={setCarType}
                    engineSize={engineSizeState}
                    setEngineSize={setEngineSizeState}
                    enginePower={enginePowerState}
                    setEnginePower={setEnginePowerState}
                    carDrive={carDriveState}
                    setCarDrive={setCarDriveState}
                    carWarranty={carWarrantyState}
                    setCarWarranty={setCarWarrantyState}
                    carAdvertiser={carAdvertiserState}
                    setCarAdvertiser={setCarAdvertiserState}
                  />
                ) : subCategory === 'مشاريع عقارية قيد التنفيذ' ? (
                  <ProjectInputs
                    projectStatusState={projectStatus}
                    setProjectStatusState={setProjectStatus}
                    deliveryYearState={deliveryYear}
                    setDeliveryYearState={setDeliveryYear}
                    projectFloorsState={projectFloors}
                    setProjectFloorsState={setProjectFloors}
                    projectTypeState={projectTypeState}
                    setProjectTypeState={setProjectTypeState}
                    paymentPlanState={paymentPlanState}
                    setPaymentPlanState={setPaymentPlanState}
                    projectFinishingState={projectFinishing}
                    setProjectFinishingState={setProjectFinishing}
                    projectLandAreaState={projectLandArea}
                    setProjectLandAreaState={setProjectLandArea}
                    projectUnitsCountState={projectUnitsCount}
                    setProjectUnitsCountState={setProjectUnitsCount}
                    projectFacilities={projectFacilitiesState}
                    setProjectFacilities={setProjectFacilitiesState}
                    projectAmenities={projectAmenitiesState}
                    setProjectAmenities={setProjectAmenitiesState}
                  />
                ) : (
                  <RealEstateInputs
                    reRooms={reRooms}
                    setReRooms={setReRooms}
                    reBaths={reBaths}
                    setReBaths={setReBaths}
                    reArea={reArea}
                    setReArea={setReArea}
                    reType={reType}
                    setReType={setReType}
                    reFloor={reFloor}
                    setReFloor={setReFloor}
                    buildingTotalFloors={buildingTotalFloorsState}
                    setBuildingTotalFloors={setBuildingTotalFloorsState}
                    reFurnished={reFurnished}
                    setReFurnished={setReFurnished}
                    reBuildingAge={reBuildingAge}
                    setReBuildingAge={setReBuildingAge}
                    heatingType={heatingTypeState}
                    setHeatingType={setHeatingTypeState}
                    hasElevator={hasElevatorState}
                    setHasElevator={setHasElevatorState}
                    hasParking={hasParkingState}
                    setHasParking={setHasParkingState}
                    titleDeedType={titleDeedTypeState}
                    setTitleDeedType={setTitleDeedTypeState}
                    propertyDirection={propertyDirectionState}
                    setPropertyDirection={setPropertyDirectionState}
                    advertiserType={advertiserTypeState}
                    setAdvertiserType={setAdvertiserTypeState}
                  />
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StepLocation
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                neighborhood={neighborhood}
                setNeighborhood={setNeighborhood}
                mapUrl={mapUrlState}
                setMapUrl={setMapUrlState}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white p-5 rounded-3xl border border-gray-150">
                <MediaSelector
                  category={category}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  imageUrls={imageUrls}
                  setImageUrls={setImageUrls}
                  videoUrls={videoUrls}
                  setVideoUrls={setVideoUrls}
                  currentMaxImages={maxImages}
                  currentMaxVideos={maxVideos}
                  PRESET_CAR_IMAGES={PRESET_CAR_IMAGES}
                  PRESET_HOME_IMAGES={PRESET_HOME_IMAGES}
                />
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StepPrice
                currency={currency}
                setCurrency={setCurrency}
                price={price}
                setPrice={setPrice}
                ownerPhone={ownerPhoneState}
                setOwnerPhone={setOwnerPhoneState}
                whatsappPhone={whatsappPhoneState}
                setWhatsappPhone={setWhatsappPhoneState}
              />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <SuccessReport
                price={price}
                currency={currency}
                title={title}
                selectedCity={selectedCity}
                neighborhood={neighborhood}
                onGoHome={() => navigate('/')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {step <= 5 && (
          <div className="flex justify-between items-center sm:px-2 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                'px-5 py-2.5 rounded-xl border border-gray-250 bg-white hover:bg-gray-100 text-xs font-black transition-all cursor-pointer flex items-center gap-1',
                step === 1 && 'opacity-0 pointer-events-none',
              )}
            >
              <ChevronRight size={13} className="rtl:rotate-180" />
              <span>السابق</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#0D3B46] text-white hover:bg-[#122538] text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <ChevronRight size={13} />
              <span>
                {step === 5 ? (submitting ? 'جاري النشر...' : 'إتمام ونشر الإعلان') : 'المتابعة التالي'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
