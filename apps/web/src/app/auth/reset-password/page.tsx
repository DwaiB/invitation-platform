'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api/client';

export default function ResetPasswordPage() {
  const router = useRouter(); const [token, setToken] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState(''); const [done, setDone] = useState(false); const [loading, setLoading] = useState(false);
  useEffect(() => setToken(new URLSearchParams(window.location.search).get('token_hash') || ''), []);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (password !== confirm) return setError('Passwords do not match'); if (!token) return setError('Invalid or missing reset link'); setLoading(true); const response = await fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify({ tokenHash: token, password }) }); setLoading(false); if (!response.success) return setError(response.error.message); setDone(true); setTimeout(() => router.push('/auth/login'), 1000); }
  return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white"><div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8"><Link href="/auth/login" className="text-sm text-amber-300">← Sign in</Link><h1 className="mt-8 text-3xl font-serif font-bold">Choose a new password</h1><form onSubmit={submit} className="mt-8 space-y-4"><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" /><input required minLength={8} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" />{error && <p className="text-sm text-rose-400">{error}</p>}{done && <p className="text-sm text-emerald-400">Password updated. Redirecting to login…</p>}<button disabled={loading || done} className="w-full rounded-lg bg-amber-400 px-4 py-3 font-semibold text-neutral-950">{loading ? 'Updating…' : 'Update password'}</button></form></div></main>;
}
