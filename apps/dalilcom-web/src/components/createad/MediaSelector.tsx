import { Trash2, Upload, Video } from 'lucide-react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

type PresetImage = { url: string; label: string };

interface MediaSelectorProps {
  category: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  imageUrls: string[];
  setImageUrls: Dispatch<SetStateAction<string[]>>;
  videoUrls?: string[];
  setVideoUrls?: Dispatch<SetStateAction<string[]>>;
  videoUrl?: string;
  setVideoUrl?: (url: string) => void;
  currentMaxImages: number;
  currentMaxVideos: number;
  PRESET_CAR_IMAGES: PresetImage[];
  PRESET_HOME_IMAGES: PresetImage[];
}

const readFile = (file: File) => new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(String(reader.result || ''));
  reader.readAsDataURL(file);
});

export function MediaSelector({
  category,
  imageUrl,
  setImageUrl,
  imageUrls,
  setImageUrls,
  videoUrls = [],
  setVideoUrls,
  videoUrl,
  setVideoUrl,
  currentMaxImages,
  currentMaxVideos,
  PRESET_CAR_IMAGES,
  PRESET_HOME_IMAGES,
}: MediaSelectorProps) {
  const presets = category === 'cars' ? PRESET_CAR_IMAGES : PRESET_HOME_IMAGES;
  const activeVideoUrl = videoUrls[0] || videoUrl || '';

  const addImage = (url: string) => {
    if (imageUrls.length >= currentMaxImages) return alert(`الحد الأقصى ${currentMaxImages} صور.`);
    if (imageUrls.includes(url)) return;
    setImageUrls(prev => [...prev, url]);
    if (!imageUrl) setImageUrl(url);
  };

  const uploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    for (const file of files) {
      if (imageUrls.length >= currentMaxImages) return alert(`الحد الأقصى ${currentMaxImages} صور.`);
      const dataUrl = await readFile(file);
      setImageUrls(prev => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));
      if (!imageUrl) setImageUrl(dataUrl);
    }
    event.target.value = '';
  };

  const uploadVideo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (currentMaxVideos <= 0) return alert('ليس لديك صلاحية لإضافة فيديو.');
    if (!file.type.startsWith('video/')) return alert('الرجاء اختيار ملف فيديو صحيح.');
    const dataUrl = await readFile(file);
    if (setVideoUrls) {
      setVideoUrls([dataUrl]);
    }
    if (setVideoUrl) {
      setVideoUrl(dataUrl);
    }
    event.target.value = '';
  };

  const clearVideo = () => {
    if (setVideoUrls) setVideoUrls([]);
    if (setVideoUrl) setVideoUrl('');
  };

  const removeImage = (index: number) => {
    const removed = imageUrls[index];
    const next = imageUrls.filter((_, idx) => idx !== index);
    setImageUrls(next);
    if (imageUrl === removed) setImageUrl(next[0] || '');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="font-extrabold text-[#0D3B46] text-sm sm:text-md">إضافة الوسائط</h3>
        <p className="text-xs text-[#C9A15A] mt-1">
          مسموح لك بإضافة {currentMaxImages} صور و {currentMaxVideos} فيديو.
        </p>
      </div>

      <div className="bg-white border border-dashed border-[#E3C98D] p-6 rounded-3xl text-center space-y-3 hover:border-[#C9A15A] relative cursor-pointer group">
        <input type="file" accept="image/*" multiple onChange={uploadImages} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A15A]/10 text-[#0D3B46] flex items-center justify-center"><Upload size={22} /></div>
          <p className="text-xs font-black text-[#2B2B2B]">اضغط هنا لرفع الصور من جهازك</p>
          <p className="text-[10px] font-bold text-[#0D3B46]">اختر الصور وسيتم إرفاقها بالإعلان تلقائياً.</p>
        </div>
      </div>

      <div className="bg-white border border-[#F6F2E8] p-4 rounded-3xl space-y-3">
        <label className="text-xs font-bold text-[#2B2B2B] block">أو اختر من الصور التوضيحية:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presets.map(item => {
            const selected = imageUrls.includes(item.url);
            return (
              <button key={item.url} type="button" onClick={() => addImage(item.url)}
                className={`relative rounded-xl overflow-hidden aspect-video border group transition-all cursor-pointer ${selected ? 'border-[#0D3B46] scale-95 ring-2 ring-[#C9A15A]/20' : 'border-[#E3C98D] hover:scale-[1.02]'}`}>
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-[#2B2B2B]/60 py-1 text-[9.5px] text-white font-bold text-center">{item.label}</div>
                {selected && <div className="absolute top-1 right-1 bg-[#C9A15A] text-white rounded-full w-4 h-4 text-[8px] font-black">✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {imageUrls.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#0D3B46] block">الصور المرفقة ({imageUrls.length}/{currentMaxImages}):</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square border border-[#E3C98D] rounded-xl overflow-hidden group">
                <img src={url} alt="Attached" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 left-1 bg-[#C9A15A] text-white rounded-full p-1" title="حذف الصورة"><Trash2 size={11} /></button>
                {imageUrl === url ? <div className="absolute inset-x-0 bottom-0 bg-[#0D3B46] text-white text-[8.5px] font-black text-center py-0.5">غلاف</div>
                  : <button type="button" onClick={() => setImageUrl(url)} className="absolute inset-x-0 bottom-0 bg-[#2B2B2B]/70 text-white text-[8px] font-bold py-0.5 opacity-0 group-hover:opacity-100">تحديد كغلاف</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#F6F2E8] p-4 rounded-3xl space-y-3">
        <label className="text-xs font-bold text-[#0D3B46] flex items-center gap-1">
          <Video size={14} className="text-[#C9A15A]" /> فيديو اختياري من ملفات الجهاز
        </label>
        <div className="border border-dashed border-[#E3C98D] rounded-2xl p-5 text-center relative hover:border-[#C9A15A]">
          <input type="file" accept="video/*" onChange={uploadVideo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <p className="text-xs font-black text-[#2B2B2B]">اضغط لاختيار ملف فيديو</p>
          <p className="text-[10px] text-[#C9A15A] font-semibold">سيتم رفعه وحفظه مع الإعلان، بدون روابط خارجية.</p>
        </div>
        {activeVideoUrl && (
          <div className="space-y-2">
            <video src={activeVideoUrl} controls className="w-full max-h-56 rounded-2xl bg-[#2B2B2B]" />
            <button type="button" onClick={clearVideo} className="bg-[#C9A15A]/10 text-[#C9A15A] rounded-xl px-3 py-2 text-xs font-bold">حذف الفيديو</button>
          </div>
        )}
      </div>
    </div>
  );
}
