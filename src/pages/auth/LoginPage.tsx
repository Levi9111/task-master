import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../../queries/useAuthMutations';

// 1. Define the validation schema
const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLoginMutation();

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 3. Handle form submission
  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-bg-base p-4'>
      {/* Glass Card Container */}
      <div className='w-full max-w-md rounded-xl border border-border-default bg-bg-surface p-8 shadow-2xl backdrop-blur-md'>
        <h1 className='mb-2 text-3xl font-bold text-text-primary'>Welcome to TaskFlow</h1>
        <p className='mb-8 text-text-secondary'>Sign in to manage your team's tasks.</p>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          {/* Email Input */}
          <div>
            <label className='mb-1 block text-sm font-medium text-text-secondary'>Email</label>
            <input
              {...register('email')}
              type='email'
              className='w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary'
              placeholder='name@example.com'
            />
            {errors.email && (
              <p className='mt-1 text-sm text-accent-danger'>{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className='mb-1 block text-sm font-medium text-text-secondary'>Password</label>
            <input
              {...register('password')}
              type='password'
              className='w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary'
              placeholder='••••••••'
            />
            {errors.password && (
              <p className='mt-1 text-sm text-accent-danger'>{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loginMutation.isPending}
            className='w-full rounded-lg bg-accent-primary p-3 font-semibold text-white transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
