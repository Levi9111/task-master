import { useEffect, useRef } from 'react';
import { useAuth } from '../../app/hooks.useAuth';
import { UserCircle, Shield, Mail, LogOut, Sparkles } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import { logout } from '../../app/slices/authSlice';
import { addToast } from '../../app/slices/notificationSlice';
import { tokenStorage } from '../../utils/tokenStorage';
import gsap from 'gsap';

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    tokenStorage.clear();
    dispatch(logout());
    dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left avatar card entrance
      gsap.fromTo(
        '.animate-profile-card',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
      );

      // Right form details container
      gsap.fromTo(
        '.animate-details-card',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
      );

      // Profile details rows animation
      gsap.fromTo(
        '.animate-detail-row',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Profile Settings</h1>
          <p className="text-text-secondary mt-1">Manage your secure account credentials and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Details Card */}
        <div className="animate-profile-card md:col-span-1 rounded-2xl border border-border-default bg-bg-surface p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-primary to-accent-secondary" />
          
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 text-accent-primary border border-accent-primary/30 flex items-center justify-center font-bold text-4xl mb-4 shadow-lg shadow-accent-primary/5">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/10 text-accent-primary mt-2.5 border border-accent-primary/20">
            <Shield className="h-3 w-3" />
            {user?.role}
          </span>

          <button
            onClick={handleLogout}
            className="w-full mt-8 flex items-center justify-center gap-2 rounded-xl border border-accent-danger/20 hover:bg-accent-danger/10 text-accent-danger py-3.5 px-4 font-bold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Account Info Details */}
        <div className="animate-details-card md:col-span-2 rounded-2xl border border-border-default bg-bg-surface p-6 sm:p-8 shadow-xl space-y-6 relative">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h3 className="text-lg font-bold text-text-primary">Personal Details</h3>
            <span className="flex items-center gap-1 text-3xs font-bold text-text-muted uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent-secondary" />
              Verified Workspace
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="animate-detail-row space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
              <div className="flex items-center gap-2.5 text-text-primary bg-bg-base/40 p-3.5 rounded-xl border border-border-subtle hover:bg-bg-base/70 transition-colors">
                <UserCircle className="h-5 w-5 text-text-secondary" />
                <span className="font-medium text-sm">{user?.name}</span>
              </div>
            </div>

            <div className="animate-detail-row space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-2.5 text-text-primary bg-bg-base/40 p-3.5 rounded-xl border border-border-subtle hover:bg-bg-base/70 transition-colors">
                <Mail className="h-5 w-5 text-text-secondary" />
                <span className="font-medium text-sm">{user?.email}</span>
              </div>
            </div>

            <div className="animate-detail-row space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">System Role</label>
              <div className="flex items-center gap-2.5 text-text-primary bg-bg-base/40 p-3.5 rounded-xl border border-border-subtle hover:bg-bg-base/70 transition-colors">
                <Shield className="h-5 w-5 text-text-secondary" />
                <span className="font-medium text-sm">{user?.role}</span>
              </div>
            </div>

            <div className="animate-detail-row space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Account ID</label>
              <div className="flex items-center gap-2.5 text-text-primary bg-bg-base/40 p-3.5 rounded-xl border border-border-subtle font-mono text-xs hover:bg-bg-base/70 transition-colors">
                <span className="truncate text-text-secondary">{user?._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
