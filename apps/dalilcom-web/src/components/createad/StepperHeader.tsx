import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepperHeaderProps {
  currentStep: number;
  steps: { id: number; label: string }[];
}

export function StepperHeader({ currentStep, steps }: StepperHeaderProps) {
  const navigate = useNavigate();
  return (
    <>
      <div className="bg-[#0D3B46] text-white" dir="rtl">
        <div className="flex items-center px-4 h-16 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronRight size={24} className="rtl:-scale-x-100" />
            <span className="text-sm font-semibold">إلغاء الرجوع</span>
          </button>
          <div className="flex-1 text-center font-bold text-base sm:text-lg pr-4">
            إضافة إعلان جديد — دليلكم
          </div>
        </div>
      </div>

      {currentStep <= 5 && (
        <div className="bg-white border-b border-[#E3C98D] py-3 overflow-x-auto text-right" dir="rtl">
          <div className="flex items-center justify-center max-w-4xl mx-auto px-4 gap-2.5 sm:gap-4">
            {steps.map((st) => (
              <div key={st.id} className="flex items-center gap-1.5 shrink-0">
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  st.id === currentStep 
                    ? "bg-[#0D3B46] text-white ring-4 ring-[#0D3B46]/10" 
                    : st.id < currentStep 
                      ? "bg-[#C9A15A] text-white" 
                      : "bg-[#F6F2E8] text-[#C9A15A]"
                )}>
                  {st.id < currentStep ? '✓' : st.id}
                </div>
                <span className={cn("text-[10px] sm:text-xs font-bold", st.id === currentStep ? "text-[#2B2B2B]" : "text-[#C9A15A]")}>
                  {st.label}
                </span>
                {st.id < steps.length && <div className="w-10 h-[1.5px] bg-[#F6F2E8]" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
