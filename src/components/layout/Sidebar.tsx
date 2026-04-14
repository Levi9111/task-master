import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BarChart2, UserCircle } from 'lucide-react';
import gsap from 'gsap';
import { useAppSelector } from '../../app/store';
import { cn } from '../../utils/cn';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/teams', label: 'Teams', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export const Sidebar = () => {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const sidebarRef = useRef<HTMLElement>(null);

  // GSAP Animation for collapsing/expanding
  useEffect(() => {
    if (!sidebarRef.current) return;

    // We store the animation in a variable so we can kill it if the component unmounts
    const ctx = gsap.context(() => {
      gsap.to(sidebarRef.current, {
        width: sidebarCollapsed ? 80 : 260,
        duration: 0.35,
        ease: 'power2.inOut',
      });
    }, sidebarRef);

    return () => ctx.revert(); // Memory cleanup! Crucial for React + GSAP.
  }, [sidebarCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className='fixed left-0 top-0 z-40 h-screen border-r border-border-default bg-bg-surface overflow-hidden'
    >
      <div className='flex h-16 items-center px-6'>
        {/* Placeholder Logo */}
        <div className='h-8 w-8 rounded bg-accent-primary flex-shrink-0' />
        {!sidebarCollapsed && (
          <span className='ml-3 font-bold text-lg text-text-primary whitespace-nowrap'>
            TaskFlow
          </span>
        )}
      </div>

      <nav className='mt-6 flex flex-col gap-2 px-4'>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3 py-2.5 text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary',
                isActive && 'bg-bg-overlay text-accent-primary font-medium',
                sidebarCollapsed && 'justify-center px-0',
              )
            }
          >
            <item.icon size={20} className='flex-shrink-0' />
            {!sidebarCollapsed && <span className='ml-3 whitespace-nowrap'>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
