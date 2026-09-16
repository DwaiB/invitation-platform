'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth';

export default function NewInvitationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', type: 'wedding', description: '', location: '', eventDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    const response = await fetchApi<{ _id: string }>('/invitations', {
      method: 'POST', token: getAccessToken() ?? undefined, body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.success) return setError(response.error.message);
    router.push(`/dashboard/invitations/${response.data._id}`);
  }

  return <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white"><div className="mx-auto max-w-2xl"><Link href="/dashboard" className="text-sm text-amber-300">← Dashboard</Link><h1 className="mt-8 text-4xl font-serif font-bold">Create invitation</h1><p className="mt-2 text-neutral-400">Start with the details your guests need.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"><Field label="Invitation title" value={form.title} onChange={(value) => update('title', value)} placeholder="Rahul & Priya's Wedding" required /><label className="block text-sm text-neutral-300">Type<select value={form.type} onChange={(event) => update('type', event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white"><option value="wedding">Wedding</option><option value="birthday">Birthday</option><option value="anniversary">Anniversary</option><option value="engagement">Engagement</option><option value="party">Party</option><option value="baby_shower">Baby shower</option><option value="corporate">Corporate</option></select></label><Field label="Date" type="date" value={form.eventDate} onChange={(value) => update('eventDate', value)} /><Field label="Main location" value={form.location} onChange={(value) => update('location', value)} placeholder="Bengaluru" /><label className="block text-sm text-neutral-300">Message<textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" placeholder="We invite you to celebrate with us..." /></label>{error && <p className="text-sm text-rose-400">{error}</p>}<div className="flex justify-end gap-3"><Link href="/dashboard" className="rounded-lg border border-neutral-700 px-4 py-3 text-sm text-neutral-300">Cancel</Link><button disabled={saving} className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 disabled:opacity-50">{saving ? 'Creating…' : 'Create invitation'}</button></div></form></div></main>;
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block text-sm text-neutral-300">{label}<input required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" /></label>;
}
