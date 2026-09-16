'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth';

interface Invitation { _id: string; title: string; type: string; description?: string; location?: string; eventDate?: string; status: string }

export default function InvitationSettingsPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const token = getAccessToken(); const [invitation, setInvitation] = useState<Invitation | null>(null); const [form, setForm] = useState({ title: '', type: 'wedding', description: '', location: '', eventDate: '' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!token) { router.replace('/auth/login'); return; } fetchApi<Invitation>(`/invitations/${id}`, { token }).then((response) => { if (!response.success) return setError(response.error.message); setInvitation(response.data); setForm({ title: response.data.title, type: response.data.type, description: response.data.description || '', location: response.data.location || '', eventDate: response.data.eventDate ? response.data.eventDate.slice(0, 10) : '' }); }); }, [id]);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event: React.FormEvent) { event.preventDefault(); setSaving(true); const response = await fetchApi<Invitation>(`/invitations/${id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify(form) }); setSaving(false); if (!response.success) return setError(response.error.message); setInvitation(response.data); }
  async function remove() { if (!window.confirm('Delete this invitation? This cannot be undone.')) return; const response = await fetchApi(`/invitations/${id}`, { method: 'DELETE', token: token ?? undefined }); if (!response.success) return setError(response.error.message); router.replace('/dashboard'); }
  if (error) return <main className="min-h-screen bg-neutral-950 p-8 text-rose-300">{error}</main>;
  if (!invitation) return <main className="min-h-screen bg-neutral-950 p-8 text-neutral-400">Loading…</main>;
  return <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white"><div className="mx-auto max-w-2xl"><Link href={`/dashboard/invitations/${id}`} className="text-sm text-amber-300">← Invitation</Link><h1 className="mt-8 text-4xl font-serif font-bold">Invitation settings</h1><form onSubmit={save} className="mt-8 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"><Field label="Title" value={form.title} onChange={(value) => update('title', value)} /><Field label="Type" value={form.type} onChange={(value) => update('type', value)} /><Field label="Date" type="date" value={form.eventDate} onChange={(value) => update('eventDate', value)} /><Field label="Location" value={form.location} onChange={(value) => update('location', value)} /><label className="block text-sm text-neutral-300">Description<textarea rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" /></label><div className="flex justify-between pt-3"><button type="button" onClick={remove} className="text-sm text-rose-400">Delete invitation</button><button disabled={saving} className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950">{saving ? 'Saving…' : 'Save changes'}</button></div></form></div></main>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm text-neutral-300">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-white" /></label>; }
