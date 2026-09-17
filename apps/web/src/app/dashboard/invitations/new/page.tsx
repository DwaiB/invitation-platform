'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken, getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function NewInvitationPage() {
  const router = useRouter();
  const token = getAccessToken();

  const [userEmail, setUserEmail] = useState('');
  const [form, setForm] = useState({
    title: '',
    type: 'wedding',
    description: '',
    location: '',
    eventDate: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    getCurrentUser().then((res) => {
      if (res.success) setUserEmail(res.data.email ?? '');
    });
  }, [token, router]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Please provide a title for your invitation.');
      return;
    }
    setSaving(true);
    setError('');

    const response = await fetchApi<{ _id: string }>('/invitations', {
      method: 'POST',
      token: getAccessToken() ?? undefined,
      body: JSON.stringify({
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        eventDate: form.eventDate || undefined,
      }),
    });

    setSaving(false);
    if (!response.success) return setError(response.error.message);
    router.push(`/dashboard/invitations/${response.data._id}`);
  }

  return (
    <DashboardShell
      userEmail={userEmail}
      breadcrumbs={[
        { label: 'Creator Studio', href: '/dashboard' },
        { label: 'Invitations', href: '/dashboard/invitations' },
        { label: 'Create New' },
      ]}
      title="Create New Invitation"
      subtitle="Craft a personalized digital invitation experience for your special celebration."
    >
      <div className="mx-auto max-w-2xl">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={submit}
          className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800">
            <PartyPopper className="h-5 w-5 text-amber-400" />
            <h2 className="font-serif text-2xl font-bold text-white">Celebration Details</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Celebration Title *
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g., Sarah & Michael's Wedding Celebration"
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Celebration Type
              </label>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="engagement">Engagement</option>
                <option value="party">Party / Gala</option>
                <option value="baby_shower">Baby Shower</option>
                <option value="corporate">Corporate Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Main Event Date
              </label>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => update('eventDate', e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Main Location / City
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g., The Taj West End, Bengaluru"
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Welcome Message
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="We are delighted to invite you to celebrate this joyous occasion with us..."
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <Link
              href="/dashboard/invitations"
              className="rounded-xl border border-neutral-700 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{saving ? 'Creating Invitation...' : 'Create Invitation Studio'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
