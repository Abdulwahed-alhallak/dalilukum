import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MessageSquare } from 'lucide-react';
import { api, listApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LoginSuccessView } from './LoginSuccessView';

interface CountryItem {
  id?: number;
  name: string;
  code: string;
  flag?: string;
  mask?: string;
}

const mapCountry = (row: any): CountryItem => ({
  id: row.id ? Number(row.id) : undefined,
  name: row.name,
  code: row.phone_code,
  flag: row.flag,
  mask: row.phone_mask,
});

export function LoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [country, setCountry] = useState<CountryItem | null>(null);
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listApi<any>('/countries?per_page=200')
      .then(rows => {
        const mapped = rows.map(mapCountry);
        setCountries(mapped);
        setCountry(mapped[0] || null);
      })
      .catch(console.error);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!country || phone.length < 5 || !accepted) return;
    setLoading(true);
    const fullPhone = `${country.code} ${phone}`;
    try {
      const res: any = await api.post('/auth/login', {
        phone: fullPhone,
        country_id: country.id || null,
      });
      const userData = res?.data || res;
      login(fullPhone, userData?.id ? Number(userData.id) : undefined, country.id);
    } catch {
      login(fullPhone, undefined, country.id);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <LoginSuccessView
        phone={user.phone}
        userId={user.id}
        onCreateAd={() => navigate('/create-ad')}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto mt-4 sm:mt-8 pb-10">
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F6F2E8]/80">
        <div className="bg-[#0D3B46] text-white p-8 pb-7 text-center relative overflow-hidden">
          <div className="w-[56px] h-[56px] bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <MessageSquare size={30} />
          </div>
          <h2 className="text-2xl font-bold mb-1 tracking-tight">تسجيل الدخول</h2>
          <p className="text-white/85 text-[14px] font-medium">سجل دخولك باستخدام رقم الهاتف لإدارة إعلاناتك</p>
        </div>
        <form onSubmit={submit} className="p-6 sm:p-8 flex flex-col" dir="rtl">
          <label className="text-[13px] font-bold text-[#C9A15A] mb-2">رقم الهاتف</label>
          <div className="relative mb-5">
            <div className="flex border border-[#E3C98D] rounded-xl overflow-hidden h-13" dir="ltr">
              <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 px-3 bg-[#F6F2E8] border-r border-[#E3C98D]">
                <span className="text-xl">{country?.flag || ''}</span>
                <span className="font-bold">{country?.code || '--'}</span>
              </button>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={country?.mask || ''}
                className="flex-1 px-4 text-[16px] font-bold bg-white outline-none"
              />
            </div>
            {open && (
              <div className="absolute z-30 left-0 right-0 top-14 bg-white border border-[#F6F2E8] rounded-xl shadow-xl max-h-64 overflow-y-auto">
                {countries.map(item => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => { setCountry(item); setOpen(false); }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F6F2E8]"
                  >
                    <span className="font-medium text-[#2B2B2B]">{item.name}</span>
                    <span dir="ltr" className="font-bold text-[#C9A15A]">{item.flag} {item.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setAccepted(!accepted)} className="flex items-center gap-2 mb-6 text-right cursor-pointer">
            <span className="w-[18px] h-[18px] border border-[#E3C98D] rounded flex items-center justify-center bg-white">
              {accepted && <Check size={12} className="text-[#0D3B46]" />}
            </span>
            <span className="text-[13px] text-[#0D3B46] font-medium">أوافق على سياسة الاستخدام والخصوصية</span>
          </button>
          <button
            type="submit"
            disabled={!country || phone.length < 5 || !accepted || loading}
            className="w-full h-13 rounded-xl bg-[#0D3B46] hover:bg-[#122538] text-white font-bold text-[16px] disabled:opacity-50 cursor-pointer transition-colors"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
