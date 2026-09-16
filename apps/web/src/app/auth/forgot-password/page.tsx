'use client';

import Link from 'next/link';
import { useState } from 'react';
import { fetchApi } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(''); const response = await fetchApi<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); setLoading(false); if (!response.success) return setError(response.error.message); setMessage(response.data.message); }
  return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white"><div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8"><Link href="/auth/login" className="text-sm text-amber-300">← Sign in</Link><h1 className="mt-8 text-3xl font-serif font-bold">Reset your password</h1><p className="mt-2 text-neutral-400">We’ll send a reset link to your email.</p><form onSubmit={submit} className="mt-8 space-y-4"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" />{error && <p className="text-sm text-rose-400">{error}</p>}{message && <p className="text-sm text-emerald-400">{message}</p>}<button disabled={loading} className="w-full rounded-lg bg-amber-400 px-4 py-3 font-semibold text-neutral-950">{loading ? 'Sending…' : 'Send reset link'}</button></form></div></main>;
}
