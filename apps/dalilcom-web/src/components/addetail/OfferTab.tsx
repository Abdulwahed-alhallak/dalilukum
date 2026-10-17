import React, { useState } from 'react';
import { AdItem } from '../../types';
import { Flame, Send, Phone } from 'lucide-react';

interface OfferTabProps {
  item: AdItem;
}

const cleanPhone = (phone?: string) => (phone || '').replace(/[^\d]/g, '');

export function OfferTab({ item }: OfferTabProps) {
  const currency = item.currency || 'ل.س';
  const originalPrice = item.price;

  const [bidPrice, setBidPrice] = useState<number>(Math.floor(item.price * 0.9));
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: 'user' | 'agent' | 'system'; text: string; time?: string }>>([
    {
      id: 1,
      sender: 'agent',
      text: `مرحباً بك في نظام وساطة دليلكم الذكي. يمكنك تقديم عرض سعر ومساومة البائع فورياً هنا. السعر المطلوب حالياً هو ${item.price.toLocaleString('en-US')} ${currency}. ما هو عرضك المالي المقترح؟`,
      time: 'الآن'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const formattedPrice = (priceVal: number) => {
    return `${priceVal.toLocaleString('en-US')} ${currency}`;
  };

  const targetPhone = cleanPhone(item.whatsappPhone || item.ownerPhone);
  const whatsappUrl = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(
        `مرحباً، عبر منصة دليلكم أقترح عرض شراء للإعلان:\n` +
        `- الإعلان: ${item.title}\n` +
        `- السعر المطلوب: ${formattedPrice(item.price)}\n` +
        `- عرضي المقترح: ${formattedPrice(bidPrice)}`
      )}`
    : undefined;

  const handleSendOffer = () => {
    if (!bidPrice || bidPrice <= 0) return;
    
    const rawTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'user' as const,
      text: `أقترح شراء هذا العقار/المركبة بعرض مالي قيمته: ${formattedPrice(bidPrice)}. هل هذا مناسب؟`,
      time: rawTime
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const percentageOfOriginal = (bidPrice / originalPrice) * 100;
      let reply = '';

      if (percentageOfOriginal < 75) {
        reply = `عذراً، عرضك البالغ ${formattedPrice(bidPrice)} يمثل حوالي ${Math.round(percentageOfOriginal)}% فقط من السعر المطلوب. هذا العرض منخفض ومستبعد من قبل البائع. ننصح برفع السعر إلى 85% على الأقل.`;
      } else if (percentageOfOriginal >= 75 && percentageOfOriginal < 90) {
        reply = `عرضك (${formattedPrice(bidPrice)}) معقول نسبياً ولكنه أقل من الحد المتوقع للقبول الفوري. يمكنك النقر على زر الواتساب لمراسلة المعلن مباشرة ومواصلة النقاش.`;
      } else if (percentageOfOriginal >= 90 && percentageOfOriginal < 98) {
        reply = `ممتاز، عرض السعر (${formattedPrice(bidPrice)}) يمثل حوالي ${Math.round(percentageOfOriginal)}% من القيمة المطلوبة وهو قريب جداً من الاتفاق. يرجى النقر على زر الواتساب لإتمام الفحص والمعاينة مع المعلن.`;
      } else {
        reply = `رائع، هذا العرض مطابق لمتطلبات البائع للموافقة الفورية. اضغط على زر التواصل عبر واتساب بالأسفل لإتمام الاتفاق مباشرة مع المعلن.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent' as const,
          text: reply,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="bg-[#2B2B2B] text-white border border-[#2B2B2B] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[52vh] overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-[#C9A15A]" />
          <span className="text-xs font-black text-[#C9A15A]">مفاوض الأسعار الذكي — دليلكم</span>
        </div>
        <span className="text-[10px] text-[#C9A15A] font-semibold hidden sm:inline">تقييم فوري لعرض السعر والتواصل المباشر مع المعلن</span>
      </div>

      <div className="flex-1 overflow-y-auto my-4 space-y-4 p-2 bg-[#2B2B2B] rounded-2xl border border-white/10">
        {chatMessages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${isAgent ? 'mr-0 ml-auto' : 'mr-auto ml-0'}`}
            >
              <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                isAgent 
                  ? 'bg-white/5 text-[#F6F2E8] pr-4 rounded-tr-none border-r-4 border-[#C9A15A]' 
                  : 'bg-[#C9A15A] text-white pl-4 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className={`text-[9px] text-[#C9A15A] mt-1 ${isAgent ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'agent' ? 'الوسيط الذكي' : 'أنت'} • {msg.time || 'الآن'}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex flex-col mr-0 ml-auto max-w-[80%]">
            <div className="p-3 bg-white/5 text-[#C9A15A] rounded-2xl text-xs flex items-center gap-2">
              <span>جاري تحليل عرضك المقترح...</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-3 shrink-0 flex-col sm:flex-row">
        <div className="flex-1 w-full flex items-center gap-3">
          <div className="text-[11px] text-[#C9A15A] pr-2 shrink-0">عرض السعر ({currency}):</div>
          <input 
            type="number"
            step={100}
            value={bidPrice}
            onChange={(e) => setBidPrice(Number(e.target.value))}
            className="flex-1 h-9 bg-[#2B2B2B] border border-[#C9A15A]/40 rounded-lg outline-none text-xs text-white px-3 font-bold"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
          <button 
            onClick={handleSendOffer}
            disabled={isTyping}
            className="flex-1 sm:flex-none h-9 bg-[#C9A15A] hover:bg-[#0D3B46] disabled:opacity-50 text-white rounded-lg px-4 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Send size={13} />
            أرسل عرضك
          </button>
          
          {whatsappUrl && (
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 bg-[#0D3B46] hover:bg-[#122538] text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold shrink-0"
              title="إرسال العرض للمعلن عبر واتساب"
            >
              <Phone size={14} />
              <span>واتساب المعلن</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
