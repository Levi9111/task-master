import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '../../queries/useAuthMutations';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Lock, Mail, User, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMutation = useRegisterMutation();

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade/slide in register card
      gsap.fromTo(
        '.animate-register-card',
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Stagger input elements
      gsap.fromTo(
        '.animate-input-group',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.25 }
      );

      // Hero image zoom in
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { scale: 1.15, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-bg-base via-bg-surface to-[#0d0d15] text-text-primary overflow-hidden"
    >
      {/* Left Column: Visual Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-7 relative items-center justify-center p-12 overflow-hidden border-r border-border-default/30">
        {/* Neon Ambient Background Blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg space-y-8 text-center">
          <div ref={heroRef} className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(108,99,255,0.15)] border border-border-default">
            <img
              src="/login_hero.png"
              alt="TaskFlow Connected Workspace"
              className="w-full h-auto object-cover max-h-[460px] transform hover:scale-105 transition-transform duration-700"
            />
            {/* Elegant dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent opacity-85" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-white to-accent-secondary">
              Start Co-authoring Workflows
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Create an account and team space to manage real-time assignments, attachments, and collaborative boards.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Sign Up Form */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Glow behind card for mobile */}
        <div className="absolute w-80 h-80 rounded-full bg-accent-primary/5 blur-[100px] pointer-events-none lg:hidden" />

        <div className="animate-register-card w-full max-w-md rounded-2xl border border-border-default bg-bg-surface/50 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gradient border flash */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary" />

          {/* Logo / Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-extrabold shadow-md shadow-accent-primary/20">
              TF
            </div>
            <span className="font-extrabold text-xl tracking-tight text-text-primary">
              TaskFlow
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Create Account
          </h1>
          <p className="text-text-secondary text-xs mt-1 mb-8">
            Get started with TaskFlow workspaces today.
          </p>

          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Group */}
            <div className="animate-input-group space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
                <input
                  {...register('name')}
                  type="text"
                  className="w-full rounded-xl border border-border-default bg-bg-base/40 py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:bg-bg-base/80 focus:outline-none transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-accent-danger font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Group */}
            <div className="animate-input-group space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full rounded-xl border border-border-default bg-bg-base/40 py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:bg-bg-base/80 focus:outline-none transition-all duration-200"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-accent-danger font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Group */}
            <div className="animate-input-group space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full rounded-xl border border-border-default bg-bg-base/40 py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:bg-bg-base/80 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-accent-danger font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="animate-input-group w-full rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary py-3.5 font-bold text-white shadow-lg shadow-accent-primary/20 transition-all duration-300 hover:shadow-accent-primary/45 hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent-secondary hover:text-accent-primary font-bold transition-colors hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
