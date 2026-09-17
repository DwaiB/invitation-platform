'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { login, saveAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const response = await login(email, password);
    setLoading(false);
    if (!response.success) return setError(response.error.message);
    saveAuth(response.data);
    router.push('/dashboard');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-amber-500/15 to-yellow-300/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 font-bold text-neutral-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 fill-neutral-950" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              Celebrato
            </span>
          </Link>

          <Link
            href="/auth/signup"
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
          >
            Create account
          </Link>
        </div>

        <div className="mt-8 mb-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1.5 text-xs text-neutral-400">
            Sign in to access your Creator Studio and manage celebrations.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@celebrato.app"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-amber-300/90 hover:text-amber-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-3 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Studio'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-500">
          By signing in, you agree to Celebrato&apos;s Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
