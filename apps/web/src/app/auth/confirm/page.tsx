'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmEmail, saveAuth } from '@/lib/auth';

export default function ConfirmPage() {
  const router = useRouter(); const [message, setMessage] = useState('Confirming your email…');
  useEffect(() => { const token = new URLSearchParams(window.location.search).get('token_hash'); if (!token) { setMessage('Open the confirmation link from your email to continue.'); return; } confirmEmail(token).then((response) => { if (!response.success) return setMessage(response.error.message); saveAuth(response.data); setMessage('Email confirmed. Redirecting…'); setTimeout(() => router.push('/dashboard'), 500); }); }, [router]);
  return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white"><div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center"><h1 className="text-3xl font-serif font-bold">Email confirmation</h1><p className="mt-4 text-neutral-400">{message}</p><Link href="/auth/login" className="mt-8 inline-block text-amber-300">Go to login</Link></div></main>;
}
