import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles as Star, Bell, UserRound as UserIcon, PlusCircle, Search, ChevronRight, Heart, Calculator, TrendingUp, Download, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import { ComparisonTray } from './ComparisonTray';

export function Layout() {
  const { user } = useAuth();
  const { favorites, unreadNotificationsCount } = useAds();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const navItems = [
    { to: "/", icon: Home, label: "الرئيسية" },
    { to: "/featured", icon: Star, label: "المميزة" },
    { to: "/favorites", icon: Heart, label: "المفضلة", count: favorites.length },
    { to: "/notifications", icon: Bell, label: "الإشعارات", count: unreadNotificationsCount },
  ];

  const bottomNavItems = [
    { to: "/", icon: Home, label: "الرئيسية" },
    { to: "/featured", icon: Star, label: "المميزة" },
    { type: "add" as const }, // Special central item
    { to: "/notifications", icon: Bell, label: "الإشعارات" },
    { to: "/favorites", icon: Heart, label: "المفضلة" },
  ];



  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 relative bg-[var(--color-bg-secondary)]">
      {/* Conditionally Render Top Header */}
      {pathname === '/login' ? (
        <header className="bg-[#0D3B46] text-white sticky top-0 z-50 h-15 shadow-sm border-b border-[#C9A15A]/30 flex items-center px-4 md:px-6">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center" dir="ltr">
            {/* Custom Brand Logo on the left */}
            <div 
              className="bg-[#F6F2E8] text-[#0D3B46] font-extrabold px-3 py-1.5 rounded-[4px] text-[18px] tracking-wide cursor-pointer flex items-center select-none shadow-sm hover:brightness-105 active:scale-95 transition-all text-center leading-none" 
              onClick={() => navigate('/')}
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              دليل كوم
            </div>
            
            {/* Back button (RTL back arrow) on the right */}
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight size={24} className="stroke-[2.5]" />
            </button>
          </div>
        </header>
      ) : (
        <header className="bg-[var(--color-primary)] text-white sticky top-0 z-50 py-3 px-4 md:px-6 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center h-12">
            
            {/* Right side (RTL): Logo & Navigation */}
            <div className="w-full md:w-auto flex justify-between md:justify-start items-center gap-4 md:gap-6 lg:gap-10">
              {/* Logo */}
              <div 
                className="flex items-center cursor-pointer transition-opacity hover:opacity-90 bg-[#F6F2E8] px-3.5 py-1.5 rounded-lg shadow-sm"
                onClick={() => navigate('/')}
                dir="ltr"
              >
                {/* Mobile App Logo */}
                <div className="shrink-0 flex items-center mr-2">
                  <img src="/logo-mark.png" alt="Dalilcom Logo" className="h-10 w-28 md:h-11 md:w-32 object-contain" />
                </div>
              </div>

              {/* Mobile Download Button in Header */}
              <a
                href="/dalilukum-v15.apk"
                download="dalilukum-v15.apk"

                className="md:hidden flex items-center gap-1.5 bg-[#C9A15A] hover:bg-[#b58f4a] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all"
                title="تحميل تطبيق الأندرويد"
              >
                <Download size={14} />
                <span>تحميل التطبيق</span>
              </a>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-1.5 text-[15px] font-medium transition-colors hover:text-white/80",
                        isActive ? "text-white opacity-100" : "text-[#F6F2E8]/85 opacity-90"
                      )
                    }
                  >
                    <item.icon size={18} className="fill-current" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-[#C9A15A] text-[#F6F2E8] text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Left side (RTL): Actions */}
            <div className="hidden md:flex items-center gap-3 sm:gap-4">
              {/* Download App Button */}
              <a
                href="/dalilukum-v15.apk"
                download="dalilukum-v15.apk"

                className="flex items-center gap-2 bg-[#C9A15A] hover:bg-[#b58f4a] text-white px-3.5 py-2 rounded-lg font-bold text-[13px] transition-all shadow-sm active:scale-95 cursor-pointer select-none"
                title="تحميل تطبيق الأندرويد APK"
              >
                <Download size={16} />
                <span>تحميل التطبيق</span>
              </a>

              {/* User Profile */}
              <div 
                className="flex items-center gap-1.5 text-[15px] font-medium cursor-pointer hover:text-white/80 transition-colors hidden sm:flex"
                onClick={() => navigate('/login')}
              >
                <UserIcon size={20} className="fill-current opacity-90" />
                <span>{user ? user.phone : 'تسجيل الدخول'}</span>
              </div>

              {/* Add Ad Button */}
              <button 
                onClick={() => navigate('/create-ad')}
                className="hidden sm:flex items-center gap-1.5 bg-[#F6F2E8] text-[#0D3B46] px-4 py-2 rounded-lg font-bold text-[14px] hover:bg-[#F6F2E8]/90 transition-colors shadow-sm cursor-pointer"
              >
                <PlusCircle size={18} />
                أضف إعلان
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
        <ComparisonTray />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#F6F2E8] pb-safe z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around items-center h-16">
          {bottomNavItems.map((item, index) => {
            if ('type' in item && item.type === "add") {
              return (
                <button
                  key="add-btn"
                  onClick={() => navigate('/create-ad')}
                  className="flex flex-col items-center justify-center w-full h-full relative -top-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0D3B46] border-4 border-[#F6F2E8] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                    <PlusCircle size={22} className="stroke-[2.5]" />
                  </div>
                </button>
              );
            }

            const navItem = item as { to: string; icon: any; label: string };
            return (
              <NavLink
                key={navItem.to}
                to={navItem.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                    isActive ? "text-[#0D3B46] font-bold" : "text-[#C9A15A] hover:text-[#2B2B2B]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <navItem.icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110 text-[#0D3B46] stroke-[2.5]")} />
                    <span className="text-[9px] font-bold tracking-tight">{navItem.label}</span>
                    {navItem.label === "المفضلة" && favorites.length > 0 && (
                      <span className="absolute top-1 right-1/2 translate-x-4 bg-[#C9A15A] text-[#F6F2E8] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                    {navItem.label === "الإشعارات" && unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1/2 translate-x-4 bg-[#C9A15A] text-[#F6F2E8] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </>


                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
