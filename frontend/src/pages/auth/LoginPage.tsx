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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

type AuthResponse = {
  user: { id: string; email: string; username: string };
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
};

export const LoginPage = () => {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await httpClient.post('/auth/login', data);
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
        setError(typeof message === 'string' ? message : 'Invalid credentials');
      } else {
        setError('Unable to login');
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
        <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-600">
          Sign in to manage your listings, chat with buyers, and track orders.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input type="email" placeholder="you@example.com" {...register('email')} error={formState.errors.email?.message} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input type="password" placeholder="••••••••" {...register('password')} error={formState.errors.password?.message} />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Create one
        </Link>
      </p>
    </div>
  );
};
