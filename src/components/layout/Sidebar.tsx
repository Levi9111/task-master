import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart2,
  UserCircle,
  Cpu,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { useAppSelector } from '../../app/store';
import { cn } from '../../utils/cn';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { path: '/teams',     label: 'Teams',     icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/profile',   label: 'Profile',   icon: UserCircle },
  { path: '/playground',label: 'Playground',icon: Cpu },
];

export const Sidebar = () => {
  const { sidebarCollapsed } = useAppSelector((s) => s.ui);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(sidebarRef.current, {
        width: sidebarCollapsed ? 72 : 248,
        duration: 0.35,
        ease: 'power2.inOut',
      });
    }, sidebarRef);
    return () => ctx.revert();
  }, [sidebarCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 z-40 h-screen overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0d0d18 0%, #0a0a14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        width: sidebarCollapsed ? 72 : 248,
      }}
    >
      {/* ── Logo ── */}
      <div className="flex h-[64px] flex-shrink-0 items-center px-4 gap-3">
        <div
          className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7c6fff 0%, #2dd4bf 100%)',
            boxShadow: '0 4px 16px rgba(124,111,255,0.45)',
          }}
        >
          <Zap size={16} className="relative z-10" />
          {/* inner shine */}
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)' }}
          />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <span
              className="font-extrabold text-base tracking-tight whitespace-nowrap"
              style={{
                background: 'linear-gradient(90deg, #ededff 30%, #7c6fff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TaskFlow
            </span>
            <p className="text-[10px] text-[#44445a] font-medium tracking-widest uppercase whitespace-nowrap">
              Workspace
            </p>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mb-4 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#44445a]">
            Navigation
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                sidebarCollapsed ? 'justify-center px-0' : 'px-3 gap-3',
                isActive
                  ? 'text-white'
                  : 'text-[#606080] hover:text-[#ededff]',
              )
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'linear-gradient(135deg, rgba(124,111,255,0.18) 0%, rgba(45,212,191,0.06) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(124,111,255,0.2)',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                {/* Active bar */}
                {isActive && !sidebarCollapsed && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #7c6fff, #2dd4bf)' }}
                  />
                )}

                {/* Icon wrapper */}
                <span
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center rounded-lg w-8 h-8 transition-all duration-200',
                    isActive
                      ? 'text-[#a08cff]'
                      : 'text-[#606080] group-hover:text-[#ededff]',
                  )}
                >
                  <item.icon size={18} />
                </span>

                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}

                {/* Active dot (collapsed) */}
                {isActive && sidebarCollapsed && (
                  <span
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: '#7c6fff' }}
                  />
                )}

                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <span
                    className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                    style={{
                      background: 'rgba(13,13,24,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom version tag ── */}
      {!sidebarCollapsed && (
        <div className="p-4 flex-shrink-0">
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(124,111,255,0.06)', border: '1px solid rgba(124,111,255,0.12)' }}
          >
            <p className="text-[10px] font-semibold text-[#7c6fff] tracking-widest uppercase">v1.0.0-beta</p>
            <p className="text-[9px] text-[#44445a] mt-0.5">TaskFlow Platform</p>
          </div>
        </div>
      )}
    </aside>
  );
};
