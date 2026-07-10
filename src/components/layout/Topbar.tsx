import { useState } from 'react';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { toggleSidebar } from '../../app/slices/uiSlice';
import { useAuth } from '../../app/hooks.useAuth';
import { Link } from 'react-router-dom';

export const Topbar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { sidebarCollapsed } = useAppSelector((s) => s.ui);
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between px-6 transition-all duration-300"
      style={{
        left: sidebarCollapsed ? 72 : 248,
        background: 'rgba(6,6,12,0.8)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left — toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-[#606080] hover:text-[#ededff] transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Menu size={17} />
        </button>

        {/* Search bar */}
        <div
          className="relative hidden sm:flex items-center"
          style={{ width: searchFocused ? 280 : 220, transition: 'width 0.25s ease' }}
        >
          <Search
            size={14}
            className="absolute left-3.5 text-[#44445a] pointer-events-none transition-colors"
            style={{ color: searchFocused ? '#7c6fff' : '#44445a' }}
          />
          <input
            type="text"
            placeholder="Search tasks, teams…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-4 py-2 text-[13px] text-[#ededff] placeholder-[#44445a] rounded-xl outline-none transition-all duration-200"
            style={{
              background: searchFocused ? 'rgba(124,111,255,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${searchFocused ? 'rgba(124,111,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: searchFocused ? '0 0 0 3px rgba(124,111,255,0.08)' : 'none',
            }}
          />
          {searchFocused && (
            <span
              className="absolute right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(124,111,255,0.15)', color: '#7c6fff' }}
            >
              ⌘K
            </span>
          )}
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl text-[#606080] hover:text-[#ededff] transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Bell size={17} />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{
              background: '#7c6fff',
              borderColor: '#06060c',
              boxShadow: '0 0 6px rgba(124,111,255,0.7)',
            }}
          />
        </button>

        {/* Divider */}
        <div className="h-8 w-px mx-1" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* User menu */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200 group"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          {/* Avatar */}
          <div
            className="relative h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c6fff 0%, #2dd4bf 100%)',
              boxShadow: '0 0 0 2px rgba(124,111,255,0.3), 0 0 12px rgba(124,111,255,0.25)',
            }}
          >
            {initials}
            {/* Online indicator */}
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background: '#10b981',
                borderColor: '#06060c',
                boxShadow: '0 0 6px rgba(16,185,129,0.6)',
              }}
            />
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-[13px] font-semibold text-[#ededff] leading-tight whitespace-nowrap max-w-[120px] truncate">
              {user?.name}
            </span>
            <span
              className="text-[10px] font-semibold leading-tight"
              style={{
                background: user?.role === 'Admin'
                  ? 'linear-gradient(90deg, #f59e0b, #f43f5e)'
                  : 'linear-gradient(90deg, #7c6fff, #2dd4bf)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {user?.role}
            </span>
          </div>

          <ChevronDown size={13} className="text-[#44445a] hidden md:block group-hover:text-[#7c6fff] transition-colors" />
        </Link>
      </div>
    </header>
  );
};
