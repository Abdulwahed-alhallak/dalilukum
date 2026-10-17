import React, { useState } from 'react';
import {
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  CarFront,
  Building2,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../context/AdsContext';
import { api } from '../lib/api';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminAdsTab } from '../components/admin/AdminAdsTab';
import { AdminBrandsTab } from '../components/admin/AdminBrandsTab';
import { AdminRealEstateTab } from '../components/admin/AdminRealEstateTab';
import { AdminUserLimitsTab } from '../components/admin/AdminUserLimitsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';

const ADMIN_SESSION_KEY = 'dalil_admin_auth';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'brands' | 'realestate' | 'user_limits' | 'settings'>('overview');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true' || sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    ads,
    deleteAd,
    updateAd,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    carModelsMap,
    updateCarModels,
    realEstateCats,
    updateRealEstateCat,
    realEstateSubs,
    updateRealEstateSubs,
    iconOverrides,
    updateIconOverride,
    userLimits,
    updateUserLimit,
    deleteUserLimit,
    defaultLimits,
    updateDefaultLimits,
  } = useAds();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adSearchQuery, setAdSearchQuery] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await api.post<any>('/admin/login', {
        username: username.trim(),
        password: password.trim(),
      });
      if (res?.authenticated) {
        if (rememberMe) {
          localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        } else {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        }
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleDeleteAd = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الإعلان: "${title}"؟`)) {
      deleteAd(id);
      showToast('تم حذف الإعلان بنجاح');
    }
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    updateAd(id, { isFeatured: !currentFeatured });
    showToast(currentFeatured ? 'تم إلغاء ميزة الإعلان' : 'تم ترقية الإعلان للمميزة');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6F2E8] flex flex-col justify-center items-center p-4 font-sans text-right select-none" dir="rtl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C9A15A]/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2B2B2B]/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#C9A15A]/20 p-8 sm:p-10 space-y-8 z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#2B2B2B] text-[#C9A15A] flex items-center justify-center mx-auto shadow-lg shadow-[#2B2B2B]/20 mb-2">
              <ShieldCheck size={36} />
            </div>
            <h1 className="text-2xl font-black text-[#2B2B2B]">لوحة التحكم</h1>
            <p className="text-xs font-semibold text-[#8C7A5B]">
              منصة دليلكم — تسجيل الدخول إلى أدوات الإدارة
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in shake duration-200">
              <AlertCircle size={18} className="shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#2B2B2B]">اسم المستخدم</label>
              <div className="relative flex items-center">
                <div className="absolute right-3.5 text-[#C9A15A] pointer-events-none">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  required
                  className="w-full bg-[#F6F2E8]/60 border border-[#E5DDCB] focus:border-[#C9A15A] focus:bg-white text-[#2B2B2B] font-bold text-sm rounded-2xl pr-11 pl-4 py-3.5 outline-none transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#2B2B2B]">كلمة المرور</label>
              <div className="relative flex items-center">
                <div className="absolute right-3.5 text-[#C9A15A] pointer-events-none">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F6F2E8]/60 border border-[#E5DDCB] focus:border-[#C9A15A] focus:bg-white text-[#2B2B2B] font-bold text-sm rounded-2xl pr-11 pl-11 py-3.5 outline-none transition-all placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 text-stone-400 hover:text-[#2B2B2B] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#2B2B2B]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C9A15A] focus:ring-[#C9A15A] border-stone-300"
                />
                <span>تذكر تسجيل الدخول</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-[#C9A15A] hover:text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#2B2B2B]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#C9A15A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول إلى لوحة التحكم</span>
                  <ArrowRight size={18} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#F6F2E8] text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-bold text-[#8C7A5B] hover:text-[#2B2B2B] transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>العودة إلى الموقع الرئيسي</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F6F2E8] text-right fixed inset-0 z-[200] animate-in fade-in select-none" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2B2B2B] text-white flex flex-col shadow-xl shrink-0">
        <div className="p-6 border-b border-[#3D3D3D] flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-white">لوحة التحكم</h1>
            <span className="text-[11px] text-[#C9A15A] font-semibold mt-0.5">منصة دليلكم</span>
          </div>
          <div className="p-1 px-2.5 bg-[#C9A15A] rounded-full text-[10px] font-bold text-white tracking-widest">
            PRO
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview' as const, label: 'لوحة القيادة', icon: LayoutDashboard },
            { id: 'ads' as const, label: 'سجلات الإعلانات', icon: FileText },
            { id: 'brands' as const, label: 'شركات وماركات السيارات', icon: CarFront },
            { id: 'realestate' as const, label: 'الفئات والأقسام العقارية', icon: Building2 },
            { id: 'user_limits' as const, label: 'صلاحيات وحدود الرفع', icon: Users },
            { id: 'settings' as const, label: 'إعدادات المنصة العامة', icon: Settings },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[14px] transition-all duration-200 outline-none cursor-pointer ${
                  isActive
                    ? 'bg-[#C9A15A] text-white shadow-lg shadow-[#C9A15A]/20 scale-[1.02]'
                    : 'text-[#E5DDCB] hover:bg-[#3D3D3D] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} className={isActive ? 'text-white' : 'text-[#C9A15A]'} />
                  <span>{tab.label}</span>
                </div>
                <ChevronLeft
                  size={14}
                  className={`opacity-40 transition-transform ${isActive ? 'rotate-90 text-white opacity-100' : ''}`}
                />
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#3D3D3D] bg-[#2B2B2B]/80 space-y-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl font-bold text-[#E5DDCB] hover:text-white hover:bg-[#3D3D3D] transition-all text-xs cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>العودة لواجهة المستخدم</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl font-bold text-red-300 hover:text-white hover:bg-red-900/40 transition-all text-xs cursor-pointer"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج من لوحة التحكم</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {toastMessage && (
          <div className="fixed top-6 left-6 bg-[#2B2B2B] border border-[#C9A15A]/40 text-white flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl z-[500] animate-in slide-in-from-left-4 duration-300 text-xs font-bold">
            <CheckCircle2 size={16} className="text-[#C9A15A]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#F6F2E8] flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex-1">
            <h2 className="text-[#2B2B2B] font-extrabold text-lg mr-2">
              {activeTab === 'overview' && 'لوحة القيادة وعدادات النظام'}
              {activeTab === 'ads' && 'البوابة الشاملة للإشراف على النشر'}
              {activeTab === 'brands' && 'إدارة ماركات السيارات والشعارات'}
              {activeTab === 'realestate' && 'التحكم بالبنية العقارية وقوائم الفئات'}
              {activeTab === 'user_limits' && 'إدارة صلاحيات وحدود رفع وسائط المستخدمين'}
              {activeTab === 'settings' && 'تخصيص الخيارات والإعدادات للمنصة'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#F6F2E8] text-[#2B2B2B] text-xs px-4 py-2 rounded-full font-extrabold border border-[#E5DDCB] shadow-sm flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#C9A15A]" />
              <span>لوحة التحكم</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#E3C98D] bg-[#C9A15A]/10 flex items-center justify-center font-bold text-[#C9A15A] shadow-inner">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'overview' && <AdminOverviewTab ads={ads} />}
            {activeTab === 'ads' && (
              <AdminAdsTab
                ads={ads}
                adQuery={adSearchQuery}
                setAdQuery={setAdSearchQuery}
                onToggleFeatured={handleToggleFeatured}
                onDeleteAd={handleDeleteAd}
              />
            )}
            {activeTab === 'brands' && (
              <AdminBrandsTab
                brands={brands}
                carModelsMap={carModelsMap}
                addBrand={addBrand}
                updateBrand={updateBrand}
                deleteBrand={deleteBrand}
                updateCarModels={updateCarModels}
                showToast={showToast}
              />
            )}
            {activeTab === 'realestate' && (
              <AdminRealEstateTab
                realEstateCats={realEstateCats}
                realEstateSubs={realEstateSubs}
                iconOverrides={iconOverrides}
                updateRealEstateCat={updateRealEstateCat}
                updateRealEstateSubs={updateRealEstateSubs}
                updateIconOverride={updateIconOverride}
                showToast={showToast}
              />
            )}
            {activeTab === 'user_limits' && (
              <AdminUserLimitsTab
                userLimits={userLimits}
                defaultLimits={defaultLimits}
                updateUserLimit={updateUserLimit}
                deleteUserLimit={deleteUserLimit}
                updateDefaultLimits={updateDefaultLimits}
                showToast={showToast}
              />
            )}
            {activeTab === 'settings' && <AdminSettingsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}
