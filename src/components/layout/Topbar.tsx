import { Menu, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { toggleSidebar } from '../../app/slices/uiSlice';
import { useAuth } from '../../app/hooks.useAuth';

export const Topbar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <header
      className='fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-bg-surface px-6 transition-all duration-300'
      style={{ left: sidebarCollapsed ? '80px' : '260px' }}
    >
      <div className='flex items-center'>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className='rounded-md p-2 text-text-secondary hover:bg-bg-overlay hover:text-text-primary transition-colors'
        >
          <Menu size={20} />
        </button>
      </div>

      <div className='flex items-center gap-4'>
        <button className='text-text-secondary hover:text-text-primary'>
          <Bell size={20} />
        </button>
        <div className='flex items-center gap-3 border-l border-border-default pl-4'>
          <div className='flex flex-col text-right'>
            <span className='text-sm font-medium text-text-primary'>{user?.name}</span>
            <span className='text-xs text-text-muted'>{user?.role}</span>
          </div>
          <div className='h-9 w-9 rounded-full bg-accent-secondary text-bg-base flex items-center justify-center font-bold'>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
