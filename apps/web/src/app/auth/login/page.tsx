'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, saveAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    const response = await login(email, password);
    setLoading(false);
    if (!response.success) return setError(response.error.message);
    saveAuth(response.data); router.push('/dashboard');
  }

  return <AuthShell title="Welcome back" subtitle="Sign in to manage your invitations.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} />
      <Field label="Password" type="password" value={password} onChange={setPassword} />
      <div className="text-right"><Link href="/auth/forgot-password" className="text-xs text-amber-300">Forgot password?</Link></div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-amber-400 px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <p className="mt-6 text-center text-sm text-neutral-400">New here? <Link className="text-amber-300" href="/auth/signup">Create an account</Link></p>
  </AuthShell>;
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm text-neutral-300">{label}<input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-amber-400" /></label>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white"><div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8"><Link href="/" className="text-sm text-amber-300">← Celebrato</Link><h1 className="mt-8 text-3xl font-serif font-bold">{title}</h1><p className="mt-2 mb-8 text-neutral-400">{subtitle}</p>{children}</div></main>;
}
