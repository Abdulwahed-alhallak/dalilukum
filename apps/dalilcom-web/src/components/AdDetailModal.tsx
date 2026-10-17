import React, { useState } from 'react';
import { AdItem } from '../types';
import { X, ShieldCheck, Heart, GitCompare, Pencil, Save, Calculator, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useAds } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { DetailsTab } from './addetail/DetailsTab';
import { CalculatorTab } from './addetail/CalculatorTab';
import { OfferTab } from './addetail/OfferTab';

interface AdDetailModalProps {
  item: AdItem;
  onClose: () => void;
}

const normalizeDigits = (val?: string) => (val || '').replace(/\D/g, '');

export function AdDetailModal({ item, onClose }: AdDetailModalProps) {
  const { toggleFavorite, isFavorite, toggleComparison, isInComparison, updateAd } = useAds();
  const { user } = useAuth();
  const fav = isFavorite(item.id);
  const comp = isInComparison(item.id);
  const [activeTab, setActiveTab] = useState<'details' | 'calculator' | 'offer'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('dalil_admin_auth') === 'true';
  const normUserPhone = normalizeDigits(user?.phone);
  const normOwnerPhone = normalizeDigits(item.ownerPhone);
  const isOwner = Boolean(
    user && (
      (user.id && item.ownerUserId && user.id === item.ownerUserId) ||
      (normUserPhone.length >= 7 && normOwnerPhone.length >= 7 && (normOwnerPhone.endsWith(normUserPhone.slice(-8)) || normUserPhone.endsWith(normOwnerPhone.slice(-8))))
    )
  );
  const canEdit = isAdmin || isOwner;

  const [draft, setDraft] = useState({
    title: item.title || '',
    description: item.description || '',
    price: String(item.price || ''),
    currency: item.currency || 'ل.س',
    location: item.location || '',
    ownerPhone: item.ownerPhone || '',
    whatsappPhone: item.whatsappPhone || '',
    imageUrl: item.imageUrl || '',
  });

  const setDraftField = (key: keyof typeof draft, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateAd(item.id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        price: Number(draft.price.replace(/[^\d.]/g, '')) || 0,
        currency: draft.currency,
        location: draft.location.trim(),
        ownerPhone: draft.ownerPhone.trim(),
        whatsappPhone: draft.whatsappPhone.trim(),
        imageUrl: draft.imageUrl.trim(),
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0D3B46]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden border border-[#F6F2E8]"
      >
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#F6F2E8] flex items-center justify-between bg-[#F6F2E8] shrink-0 gap-3">
          <div className="text-[11px] text-[#0D3B46] font-extrabold flex items-center gap-1 bg-[#C9A15A]/15 px-2.5 py-1 rounded-full border border-[#C9A15A]/30">
            <ShieldCheck size={13} />
            <span>إعلان موثق ضمن دليلكم</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-[#F6F2E8] bg-white px-3 py-1.5 shadow-sm">
            <img src="/logo-mark.png" alt="دليلكم" className="h-9 w-24 object-contain" />
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => (isEditing ? saveEdit() : setIsEditing(true))}
                disabled={saving}
                className="h-10 px-3 rounded-full flex items-center gap-2 transition-all cursor-pointer border bg-[#C9A15A] border-[#C9A15A] text-white disabled:opacity-60"
                title={isEditing ? 'حفظ التعديلات' : 'تعديل الإعلان'}
              >
                {isEditing ? <Save size={17} /> : <Pencil size={17} />}
                <span className="text-xs font-black hidden sm:inline">{isEditing ? (saving ? 'جاري الحفظ' : 'حفظ') : 'تعديل'}</span>
              </button>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="h-10 px-3 rounded-full border border-[#E3C98D] bg-[#F6F2E8] text-[#0D3B46] text-xs font-black disabled:opacity-60"
              >
                إلغاء
              </button>
            )}
            <button
              onClick={() => toggleComparison(item.id)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border',
                comp ? 'bg-[#2B2B2B] border-[#2B2B2B] text-white' : 'bg-[#F6F2E8] border-[#E3C98D] text-[#0D3B46] hover:bg-[#F6F2E8]',
              )}
              title={comp ? 'حذف من المقارنة' : 'إضافة للمقارنة'}
            >
              <GitCompare size={18} />
            </button>
            <button
              onClick={() => toggleFavorite(item.id)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border',
                fav ? 'bg-[#C9A15A]/10 border-[#C9A15A]/25 text-[#C9A15A]' : 'bg-[#F6F2E8] border-[#E3C98D] text-[#0D3B46] hover:bg-[#F6F2E8]',
              )}
              title={fav ? 'حذف من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart size={18} className={cn(fav && 'fill-[#C9A15A]')} />
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-[#F6F2E8] flex items-center justify-center text-[#0D3B46] cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {!isEditing && (
          <div className="bg-white border-b border-[#E3C98D]/50 px-4 sm:px-8 py-2 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer',
                activeTab === 'details' ? 'bg-[#0D3B46] text-white' : 'bg-[#F6F2E8] text-[#0D3B46] hover:bg-[#E3C98D]/30'
              )}
            >
              <FileText size={14} />
              <span>التفاصيل والمواصفات</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer',
                activeTab === 'calculator' ? 'bg-[#0D3B46] text-white' : 'bg-[#F6F2E8] text-[#0D3B46] hover:bg-[#E3C98D]/30'
              )}
            >
              <Calculator size={14} />
              <span>حاسبة التمويل</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('offer')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer',
                activeTab === 'offer' ? 'bg-[#0D3B46] text-white' : 'bg-[#F6F2E8] text-[#0D3B46] hover:bg-[#E3C98D]/30'
              )}
            >
              <MessageSquare size={14} />
              <span>تقديم عرض سعر</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F6F2E8] space-y-6">
          {isEditing ? (
            <div className="bg-white border border-[#E3C98D] rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="space-y-2 text-right">
                  <span className="text-xs font-black text-[#0D3B46]">عنوان الإعلان</span>
                  <input value={draft.title} onChange={e => setDraftField('title', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46]" />
                </label>
                <label className="space-y-2 text-right">
                  <span className="text-xs font-black text-[#0D3B46]">السعر</span>
                  <input value={draft.price} onChange={e => setDraftField('price', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46]" />
                </label>
                <label className="space-y-2 text-right">
                  <span className="text-xs font-black text-[#0D3B46]">العملة</span>
                  <select value={draft.currency} onChange={e => setDraftField('currency', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46] bg-white">
                    <option value="ل.س">ل.س</option>
                    <option value="دولار">دولار</option>
                    <option value="USD">USD</option>
                    <option value="SYP">SYP</option>
                  </select>
                </label>
                <label className="space-y-2 text-right">
                  <span className="text-xs font-black text-[#0D3B46]">الموقع</span>
                  <input value={draft.location} onChange={e => setDraftField('location', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46]" />
                </label>
                <label className="space-y-2 text-right">
                  <span className="text-xs font-black text-[#0D3B46]">رقم الهاتف</span>
                  <input value={draft.ownerPhone} onChange={e => setDraftField('ownerPhone', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46]" />
                </label>
                <label className="space-y-2 text-right">
                  <span className="text-xs font-black text-[#0D3B46]">رقم الواتساب</span>
                  <input value={draft.whatsappPhone} onChange={e => setDraftField('whatsappPhone', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46]" />
                </label>
                <label className="space-y-2 text-right sm:col-span-2">
                  <span className="text-xs font-black text-[#0D3B46]">رابط الصورة الرئيسية</span>
                  <input value={draft.imageUrl} onChange={e => setDraftField('imageUrl', e.target.value)} className="w-full h-11 rounded-xl border border-[#E3C98D] px-3 text-sm font-bold outline-none focus:border-[#0D3B46]" />
                </label>
                <label className="space-y-2 text-right sm:col-span-2">
                  <span className="text-xs font-black text-[#0D3B46]">الوصف</span>
                  <textarea value={draft.description} onChange={e => setDraftField('description', e.target.value)} className="w-full min-h-28 rounded-xl border border-[#E3C98D] p-3 text-sm font-bold outline-none focus:border-[#0D3B46] resize-none" />
                </label>
              </div>
              <button onClick={saveEdit} disabled={saving} className="w-full h-12 rounded-xl bg-[#0D3B46] text-white text-sm font-black disabled:opacity-60">
                {saving ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات'}
              </button>
            </div>
          ) : activeTab === 'calculator' ? (
            <CalculatorTab item={item} />
          ) : activeTab === 'offer' ? (
            <OfferTab item={item} />
          ) : (
            <DetailsTab item={item} />
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 bg-[#0D3B46] text-[#F6F2E8]/80 text-[10px] sm:text-[11px] font-bold border-t border-[#C9A15A]/30 shrink-0 space-y-3">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
            <span>دليلكم سوريا - منصة متكاملة للإعلانات العقارية والمركبات</span>
            <span>حقوق النشر محفوظة © {new Date().getFullYear()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
