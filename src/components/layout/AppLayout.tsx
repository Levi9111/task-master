import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppSelector } from '../../app/store';

export function AppLayout() {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <div className='min-h-screen bg-bg-base'>
      <Sidebar />
      <Topbar />
      {/* Main content area */}
      <main
        className='pt-16 transition-all duration-300 min-h-screen'
        style={{ paddingLeft: sidebarCollapsed ? '80px' : '260px' }}
      >
        <div className='p-8'>
          <Outlet /> {/* Child routes will be injected here */}
        </div>
      </main>
    </div>
  );
}
