import React, { useState } from 'react';
import { AdItem } from '../../types';
import { ChevronLeft, ChevronRight, CheckCircle, MapPin, MessageCircle, Phone, Video } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DetailsTabProps {
  item: AdItem;
}

const cleanPhone = (phone?: string) => (phone || '').replace(/[^\d]/g, '');

export function DetailsTab({ item }: DetailsTabProps) {
  const allImages = item.imageUrls?.length ? item.imageUrls : [item.imageUrl].filter(Boolean);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [viewingVideo, setViewingVideo] = useState(false);
  const price = `${item.price.toLocaleString('en-US')} ${item.currency || 'ل.س'}`;
  const callPhone = cleanPhone(item.ownerPhone || item.whatsappPhone);
  const whatsappPhone = cleanPhone(item.whatsappPhone || item.ownerPhone);
  const message = encodeURIComponent(`مرحبا، أنا مهتم بالإعلان: ${item.title}`);
  const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${message}` : undefined;
  const mapUrl = item.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#2B2B2B] border border-[#F6F2E8] shadow-sm">
          {viewingVideo && item.videoUrl ? (
            <video src={item.videoUrl} controls autoPlay className="w-full h-full object-contain bg-[#2B2B2B]" />
          ) : (
            <img src={allImages[currentSlideIdx] || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          )}
          {!viewingVideo && allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentSlideIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-[#2B2B2B] flex items-center justify-center shadow z-10"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlideIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-[#2B2B2B] flex items-center justify-center shadow z-10"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {!viewingVideo && allImages.length > 0 && (
            <span className="absolute bottom-3 left-3 bg-[#2B2B2B]/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              {currentSlideIdx + 1} / {allImages.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-row-reverse">
          {item.videoUrl && (
            <button
              type="button"
              onClick={() => setViewingVideo(prev => !prev)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 flex-row-reverse',
                viewingVideo ? 'bg-[#0D3B46] text-white border-[#C9A15A]' : 'bg-[#C9A15A]/10 text-[#0D3B46] border-[#C9A15A]/25',
              )}
            >
              <Video size={13} />
              <span>{viewingVideo ? 'عرض الصور' : 'تشغيل الفيديو'}</span>
            </button>
          )}
          {!viewingVideo && allImages.length > 1 && allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIdx(idx)}
              className={cn('w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0', idx === currentSlideIdx ? 'border-[#C9A15A]' : 'border-[#E3C98D] opacity-70')}
            >
              <img src={img} className="w-full h-full object-cover" alt={`صورة ${idx + 1}`} />
            </button>
          ))}
        </div>

        <div className="p-5 bg-stone-50 border border-[#E3C98D] rounded-2xl space-y-3">
          <h4 className="font-extrabold text-[#111] text-xs">نصائح لمعاملة آمنة:</h4>
          <ul className="text-[11px] text-[#0D3B46] space-y-1.5 list-disc pl-4 pr-1">
            <li>تحقق من هوية المعلن والمستندات الرسمية قبل أي دفعة.</li>
            <li>عاين العقار على أرض الواقع وتأكد من صحة الموقع.</li>
            <li>استخدم الاتصال المباشر أو واتساب للتنسيق مع المعلن.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B] leading-tight">{item.title}</h3>
          <div className="flex items-center gap-2 text-[#C9A15A] font-semibold text-xs mt-1">
            <MapPin size={15} className="text-[#C9A15A] shrink-0" />
            <span>{item.location}</span>
          </div>
        </div>

        <div className="p-5 bg-[#C9A15A]/10 rounded-2xl border border-[#C9A15A]/25 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#C9A15A] font-bold mb-1">السعر المطلوب</span>
            <span className="text-2xl font-black text-[#C9A15A]">{price}</span>
          </div>
          {item.isFeatured && (
            <span className="bg-[#C9A15A] text-white border border-[#C9A15A] rounded-full px-3 py-1 text-[11px] font-bold">
              إعلان مميز
            </span>
          )}
        </div>

        {item.description && (
          <div className="p-5 bg-[#F6F2E8] border border-[#F6F2E8] rounded-2xl space-y-2">
            <h4 className="font-extrabold text-xs text-[#2B2B2B]">وصف الإعلان:</h4>
            <p className="text-xs text-[#2B2B2B] leading-relaxed font-bold whitespace-pre-line bg-white/60 p-3 rounded-xl border border-[#F6F2E8]">{item.description}</p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-[#2B2B2B]">تفاصيل ومواصفات الإعلان</h4>
          <div className="grid grid-cols-2 gap-3">
            {item.details.map((detail, index) => (
              <div key={index} className="p-3 bg-white border border-[#E3C98D] rounded-xl flex items-center gap-2.5 shadow-sm">
                <CheckCircle size={14} className="text-[#C9A15A] shrink-0" />
                <span className="text-xs font-bold text-[#2B2B2B]">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#2B2B2B] hover:bg-[#2B2B2B] text-white"
        >
          <MapPin size={16} />
          فتح الموقع على الخريطة
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={callPhone ? `tel:${callPhone}` : undefined}
            className={cn('h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2', callPhone ? 'bg-[#0D3B46] hover:bg-[#0D3B46] text-white' : 'bg-[#F6F2E8] text-[#C9A15A] pointer-events-none')}
          >
            <Phone size={16} />
            اتصال
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={cn('h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2', whatsappUrl ? 'bg-[#0D3B46] hover:bg-[#0D3B46] text-white' : 'bg-[#F6F2E8] text-[#C9A15A] pointer-events-none')}
          >
            <MessageCircle size={16} />
            تواصل واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
