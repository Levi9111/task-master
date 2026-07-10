import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../../queries/useAuthMutations';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Loader2, Zap, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: '⚡', title: 'Real-time collaboration', desc: 'Live task updates via WebSocket' },
  { icon: '📊', title: 'Analytics dashboard', desc: 'Track team velocity & completion' },
  { icon: '🔐', title: 'Secure by default', desc: 'JWT auth with auto token refresh' },
];

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginFormValues) => loginMutation.mutate(data);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-left > *', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.1,
      });
      gsap.fromTo('.auth-card', { opacity: 0, y: 24, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out', delay: 0.15,
      });
      gsap.fromTo('.auth-field', { opacity: 0, y: 14 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.45,
      });
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen flex"
      style={{
        background: '#06060c',
        backgroundImage: 'radial-gradient(rgba(124,111,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* ── Left Panel ── */}
      <div
        className="auth-left hidden lg:flex flex-col justify-between p-14 w-[52%] relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Background glows */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.09) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c6fff 0%, #2dd4bf 100%)',
              boxShadow: '0 4px 20px rgba(124,111,255,0.5)',
            }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <span
            className="font-extrabold text-xl tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #ededff 30%, #7c6fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TaskFlow
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.2)', color: '#a08cff' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Live platform — v1.0 beta
            </div>
            <h1
              className="text-5xl font-black leading-[1.1] tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #ededff 0%, #9090aa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Manage work<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #7c6fff 0%, #2dd4bf 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                at the speed of thought.
              </span>
            </h1>
            <p className="text-[15px] text-[#606080] leading-relaxed max-w-md">
              A professional task management platform with real-time collaboration, advanced analytics, and a developer-grade API playground.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#ededff]">{f.title}</p>
                  <p className="text-xs text-[#606080] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-[#44445a] relative z-10">
          © 2026 TaskFlow. Professional Workspace Platform.
        </p>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex flex-1 items-center justify-center p-8 relative">
        {/* Ambient glow behind card */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.07) 0%, transparent 70%)' }}
        />

        <div
          className="auth-card relative w-full max-w-[420px] rounded-3xl p-8 overflow-hidden"
          style={{
            background: 'rgba(13,13,24,0.85)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,111,255,0.08)',
          }}
        >
          {/* Top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(124,111,255,0.6), rgba(45,212,191,0.4), transparent)' }}
          />

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6fff, #2dd4bf)', boxShadow: '0 4px 12px rgba(124,111,255,0.4)' }}
            >
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-base text-[#ededff]">TaskFlow</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#ededff] tracking-tight">Sign in</h2>
          <p className="text-sm text-[#606080] mt-1 mb-8">Welcome back. Let's pick up where you left off.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="auth-field space-y-2">
              <label className="block text-xs font-semibold text-[#8080a0] uppercase tracking-wider">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-[#ededff] placeholder-[#44445a] outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: errors.email ? '1px solid rgba(244,63,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: errors.email ? '0 0 0 3px rgba(244,63,94,0.08)' : 'none',
                }}
              />
              {errors.email && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field space-y-2">
              <label className="block text-xs font-semibold text-[#8080a0] uppercase tracking-wider">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-[#ededff] placeholder-[#44445a] outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: errors.password ? '1px solid rgba(244,63,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: errors.password ? '0 0 0 3px rgba(244,63,94,0.08)' : 'none',
                }}
              />
              {errors.password && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Demo hint */}
            <div
              className="auth-field flex items-center gap-2.5 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.15)', color: '#8080a0' }}
            >
              <span>💡</span>
              <span>
                Use <span className="font-semibold text-[#a08cff]">admin@taskflow.com</span> / <span className="font-semibold text-[#a08cff]">password123</span>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="auth-field w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
              style={{
                background: 'linear-gradient(135deg, #7c6fff 0%, #5b54d4 100%)',
                boxShadow: '0 4px 20px rgba(124,111,255,0.35), 0 1px 3px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,111,255,0.55), 0 1px 3px rgba(0,0,0,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,111,255,0.35), 0 1px 3px rgba(0,0,0,0.3)'; }}
            >
              {loginMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                <> Sign in <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#606080]">
            No account yet?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#7c6fff' }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#a08cff'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#7c6fff'; }}
            >
              Create workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
