import React, { useState } from 'react';
import { TabKey } from '../types/oee';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import {
  Factory,
  Tv,
  Sun,
  Moon,
  LayoutDashboard,
  Clock,
  TrendingUp,
  BarChart3,
  Wrench,
  Sparkles,
  BookOpen,
  UploadCloud,
  Menu,
  X,
  ShieldCheck,
  User,
  LogIn
} from 'lucide-react';

interface Props {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  dark: boolean;
  onToggleDark: () => void;
  octFilter: boolean;
  onToggleOctFilter: () => void;
  shiftCount: number;
  onEnterTvMode: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  dark,
  onToggleDark,
  octFilter,
  onToggleOctFilter,
  shiftCount,
  onEnterTvMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, role, isAdmin } = useAuth();

  // All available tabs, with 'Upload report' strictly reserved for administrators
  const baseTabs: [TabKey, string, React.ElementType][] = [
    ['ov', 'Overview', LayoutDashboard],
    ['sh', 'Shifts', Clock],
    ['tr', 'Trends', TrendingUp],
    ['ch', 'Charts', BarChart3],
    ['dt', 'Downtime', Wrench],
    ['hk', 'Housekeeping', Sparkles],
    ['gd', 'Guide', BookOpen],
  ];

  const tabs: [TabKey, string, React.ElementType][] = isAdmin
    ? [...baseTabs, ['up', 'Upload report', UploadCloud]]
    : baseTabs;

  const primaryMobileTabs: [TabKey, string, React.ElementType][] = isAdmin
    ? [
        ['ov', 'Overview', LayoutDashboard],
        ['sh', 'Shifts', Clock],
        ['tr', 'Trends', TrendingUp],
        ['dt', 'Downtime', Wrench],
        ['up', 'Upload', UploadCloud],
      ]
    : [
        ['ov', 'Overview', LayoutDashboard],
        ['sh', 'Shifts', Clock],
        ['tr', 'Trends', TrendingUp],
        ['ch', 'Charts', BarChart3],
        ['dt', 'Downtime', Wrench],
      ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b px-4 py-2.5 transition-colors duration-200 ${
          dark
            ? 'bg-[#161e2e]/95 backdrop-blur-md border-[#2b3643]'
            : 'bg-white/95 backdrop-blur-md border-[#dce1e8] shadow-xs'
        }`}
      >
        <div className="max-w-[1240px] mx-auto">
          {/* Top Row: Brand & System Controls */}
          <div className="flex items-center justify-between gap-3 mb-2">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    Rig &amp; Plant Services OEE Tracker
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    live (firestore sync)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                  Industrial manufacturing &amp; downtime analytics platform
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Nov 1+ Checkbox */}
              <label
                className={`hidden md:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl border cursor-pointer font-medium select-none ${
                  dark
                    ? 'bg-[#11161d] border-[#2b3643] text-slate-300'
                    : 'bg-[#f3f5f8] border-[#dce1e8] text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!octFilter}
                  onChange={onToggleOctFilter}
                  className="accent-[#1f5fbf] w-3.5 h-3.5 rounded"
                />
                <span>Nov 1+ Only ({shiftCount} shifts)</span>
              </label>

              {/* Install App Button */}
              <PWAInstallButton />

              {/* TV Mode Button */}
              <button
                onClick={onEnterTvMode}
                title="Open Factory TV Kiosk Mode"
                aria-label="Open TV kiosk mode"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold cursor-pointer shadow-sm transition active:scale-95"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>TV Mode</span>
              </button>

              {/* Auth / Role Badge Button */}
              <button
                onClick={() => setAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition active:scale-95 ${
                  user
                    ? isAdmin
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                      : role === 'managing_director'
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                      : role === 'supervisor'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100'
                      : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                    : dark
                    ? 'bg-[#11161d] border-[#2b3643] text-slate-300 hover:bg-[#1a212b]'
                    : 'bg-white border-[#dce1e8] text-slate-700 hover:bg-slate-100'
                }`}
                title={user ? `Signed in as ${user.email} (${isAdmin ? 'Admin' : role})` : 'Sign in to dashboard'}
              >
                {user ? (
                  isAdmin ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline">Admin Mode</span>
                      <span className="sm:hidden">Admin</span>
                    </>
                  ) : role === 'managing_director' ? (
                    <>
                      <span className="text-purple-500 text-xs">👔</span>
                      <span className="hidden sm:inline">Managing Director</span>
                      <span className="sm:hidden">MD</span>
                    </>
                  ) : role === 'supervisor' ? (
                    <>
                      <span className="text-indigo-500 text-xs">📋</span>
                      <span className="hidden sm:inline">Supervisor</span>
                      <span className="sm:hidden">Sup</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span className="hidden sm:inline">{user.displayName || 'Operator'}</span>
                      <span className="sm:hidden">Operator</span>
                    </>
                  )
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Dark / Light Mode Button */}
              <button
                onClick={onToggleDark}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  dark
                    ? 'bg-[#11161d] border-[#2b3643] text-amber-300 hover:bg-[#1a212b]'
                    : 'bg-white border-[#dce1e8] text-slate-700 hover:bg-slate-100'
                }`}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {tabs.map(([k, label, IconComponent]) => {
              const active = activeTab === k;
              return (
                <button
                  key={k}
                  onClick={() => onSelectTab(k)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    active
                      ? 'bg-[#1f5fbf] text-white border-[#1f5fbf] shadow-xs'
                      : dark
                      ? 'bg-[#1a212b] text-slate-300 border-[#2b3643] hover:bg-[#242e3b] hover:text-white'
                      : 'bg-white text-slate-700 border-[#dce1e8] hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1.5 pb-2">
            {tabs.map(([k, label, IconComponent]) => {
              const active = activeTab === k;
              return (
                <button
                  key={k}
                  onClick={() => {
                    onSelectTab(k);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-left transition ${
                    active
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
            <div className="col-span-2 pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={!octFilter}
                  onChange={onToggleOctFilter}
                  className="accent-[#1f5fbf]"
                />
                <span>Nov 1+ Only ({shiftCount})</span>
              </label>
              <button
                onClick={() => {
                  onEnterTvMode();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Open TV Mode</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Ergonomic Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#11161d]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {primaryMobileTabs.map(([k, label, IconComponent]) => {
          const active = activeTab === k;
          return (
            <button
              key={k}
              onClick={() => onSelectTab(k)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                active
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
