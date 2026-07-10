import { useEffect, useRef } from 'react';
import { useAuth } from '../../app/hooks.useAuth';
import { UserCircle, Mail, LogOut, Shield, Copy, CheckCheck } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import { logout } from '../../app/slices/authSlice';
import { addToast } from '../../app/slices/notificationSlice';
import { tokenStorage } from '../../utils/tokenStorage';
import gsap from 'gsap';
import { useState } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    tokenStorage.clear();
    dispatch(logout());
    dispatch(addToast({ message: 'Signed out successfully', type: 'info' }));
  };

  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initials = user?.name
    ?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.profile-avatar', { opacity: 0, scale: 0.8, y: -10 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)',
      });
      gsap.fromTo('.profile-field', { opacity: 0, x: 20 }, {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-[900px] mx-auto space-y-7 pb-16">
      <div>
        <h1 className="text-2xl font-black text-[#ededff] tracking-tight">Profile</h1>
        <p className="text-sm text-[#606080] mt-0.5">Manage your account and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* ── Avatar Card ── */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col items-center"
          style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          {/* Header banner */}
          <div
            className="w-full h-20 relative"
            style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.2) 0%, rgba(45,212,191,0.1) 100%)' }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(rgba(124,111,255,0.15) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
          </div>

          {/* Avatar */}
          <div className="profile-avatar -mt-10 relative z-10 flex flex-col items-center px-6 pb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white border-4"
              style={{
                background: 'linear-gradient(135deg, #7c6fff, #2dd4bf)',
                borderColor: '#0d0d18',
                boxShadow: '0 8px 32px rgba(124,111,255,0.4), 0 0 0 1px rgba(124,111,255,0.3)',
              }}
            >
              {initials}
            </div>

            <h2 className="text-lg font-extrabold text-[#ededff] mt-3 text-center">{user?.name}</h2>
            <p className="text-sm text-[#606080] text-center">{user?.email}</p>

            <span
              className="mt-3 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
              style={
                user?.role === 'Admin'
                  ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }
                  : { background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.2)', color: '#a08cff' }
              }
            >
              <Shield size={10} />
              {user?.role}
            </span>

            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', color: '#f43f5e' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.14)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {/* ── Details Card ── */}
        <div
          className="md:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <div
            className="px-6 py-4 flex items-center gap-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.12)' }}>
              <UserCircle size={14} style={{ color: '#7c6fff' }} />
            </div>
            <span className="font-bold text-[15px] text-[#ededff]">Account Details</span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="profile-field space-y-1.5">
              <label className="text-[11px] font-semibold text-[#44445a] uppercase tracking-wider">Full Name</label>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <UserCircle size={15} className="text-[#44445a]" />
                <span className="text-sm font-medium text-[#cccce0]">{user?.name}</span>
              </div>
            </div>

            {/* Email */}
            <div className="profile-field space-y-1.5">
              <label className="text-[11px] font-semibold text-[#44445a] uppercase tracking-wider">Email Address</label>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Mail size={15} className="text-[#44445a]" />
                <span className="text-sm font-medium text-[#cccce0] truncate">{user?.email}</span>
              </div>
            </div>

            {/* Role */}
            <div className="profile-field space-y-1.5">
              <label className="text-[11px] font-semibold text-[#44445a] uppercase tracking-wider">System Role</label>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Shield size={15} className="text-[#44445a]" />
                <span
                  className="text-sm font-semibold"
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
            </div>

            {/* Account ID */}
            <div className="profile-field space-y-1.5">
              <label className="text-[11px] font-semibold text-[#44445a] uppercase tracking-wider">Account ID</label>
              <button
                onClick={handleCopyId}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,111,255,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {copied
                  ? <CheckCheck size={15} style={{ color: '#10b981' }} />
                  : <Copy size={15} className="text-[#44445a] group-hover:text-[#7c6fff] transition-colors" />
                }
                <span className="text-[11px] font-mono text-[#44445a] truncate">{user?._id}</span>
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div
            className="mx-6 mb-6 p-4 rounded-xl"
            style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.1)' }}
          >
            <p className="text-xs font-semibold text-[#f43f5e] mb-1">Danger Zone</p>
            <p className="text-xs text-[#606080]">
              Account deletion and data export are managed by your workspace administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
