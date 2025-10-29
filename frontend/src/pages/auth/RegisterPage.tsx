import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { httpClient } from '../../lib/http';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../lib/hooks/useAuth';

const registerSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

type AuthResponse = {
  user: { id: string; email: string; username: string };
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
};

export const RegisterPage = () => {
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const payload = {
        email: data.email,
        username: data.username,
        password: data.password,
      };
      const response = await httpClient.post('/auth/register', payload);
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as any)?.message;
        setError(typeof message === 'string' ? message : 'Unable to register');
      } else {
        setError('Unable to register');
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    mutation.mutate(values);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Create your seller account</h2>
        <p className="text-sm text-slate-600">
          Set up your marketplace profile to list products and sell securely.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input type="email" placeholder="you@example.com" {...register('email')} error={formState.errors.email?.message} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Username</label>
          <Input placeholder="@username" {...register('username')} error={formState.errors.username?.message} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input type="password" placeholder="••••••••" {...register('password')} error={formState.errors.password?.message} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Confirm Password</label>
          <Input type="password" placeholder="••••••••" {...register('confirmPassword')} error={formState.errors.confirmPassword?.message} />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};
