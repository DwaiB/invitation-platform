'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Settings,
  Sparkles,
  Trash2,
  Save,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken, getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

interface Invitation {
  _id: string;
  title: string;
  type: string;
  description?: string;
  location?: string;
  eventDate?: string;
  status: string;
}

export default function InvitationSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = getAccessToken();

  const [userEmail, setUserEmail] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'wedding',
    description: '',
    location: '',
    eventDate: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    Promise.all([
      getCurrentUser(),
      fetchApi<Invitation>(`/invitations/${id}`, { token }),
    ]).then(([userRes, invRes]) => {
      if (userRes.success) setUserEmail(userRes.data.email ?? '');
      if (!invRes.success) return setError(invRes.error.message);

      setInvitation(invRes.data);
      setForm({
        title: invRes.data.title,
        type: invRes.data.type,
        description: invRes.data.description || '',
        location: invRes.data.location || '',
        eventDate: invRes.data.eventDate ? invRes.data.eventDate.slice(0, 10) : '',
      });
    });
  }, [id, token, router]);

  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    const response = await fetchApi<Invitation>(`/invitations/${id}`, {
      method: 'PATCH',
      token: token ?? undefined,
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

    setInvitation(response.data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  async function handleDelete() {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this celebration? All events, guests, RSVPs, and personalized capability links will be permanently erased.',
      )
    ) {
      return;
    }

    setDeleting(true);
    setError('');

    const response = await fetchApi(`/invitations/${id}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    setDeleting(false);

    if (!response.success) return setError(response.error.message);

    router.replace('/dashboard/invitations');
  }

  if (error && !invitation) {
    return (
      <DashboardShell userEmail={userEmail}>
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/40 p-6 text-rose-300">
          <p className="font-semibold">{error}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-300 hover:underline"
          >
            ← Back to Creator Studio
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (!invitation) {
    return (
      <DashboardShell userEmail={userEmail}>
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/40 p-12 text-center text-neutral-400">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
            <p className="text-sm">Loading invitation settings...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      userEmail={userEmail}
      breadcrumbs={[
        { label: 'Creator Studio', href: '/dashboard' },
        { label: invitation.title, href: `/dashboard/invitations/${id}` },
        { label: 'Settings' },
      ]}
      title="Invitation Settings"
      subtitle="Modify celebration parameters, venue defaults, and manage invitation lifecycle."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-4 text-sm text-emerald-300 animate-in fade-in">
            Invitation settings updated successfully!
          </div>
        )}

        {/* General Details Form */}
        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800">
            <Settings className="h-5 w-5 text-amber-400" />
            <h2 className="font-serif text-2xl font-bold text-white">General Information</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Celebration Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Celebration Type
              </label>
              <select
                value={form.type}
                onChange={(e) => updateForm('type', e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="engagement">Engagement</option>
                <option value="party">Party</option>
                <option value="baby_shower">Baby Shower</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Main Event Date
              </label>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => updateForm('eventDate', e.target.value)}
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
              onChange={(e) => updateForm('location', e.target.value)}
              placeholder="e.g., Bengaluru, Karnataka"
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
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="A message inviting your guests..."
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <Link
              href={`/dashboard/invitations/${id}`}
              className="rounded-xl border border-neutral-700 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

        {/* Danger Zone Card */}
        <div className="rounded-3xl border border-rose-950/60 bg-rose-950/10 p-6 sm:p-8 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-serif text-xl font-bold">Danger Zone</h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Deleting this invitation will immediately disable all public and personalized capability URLs, cancel all guest registrations, and permanently erase all event data. This action cannot be undone.
          </p>
          <div className="pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-800/80 bg-rose-950/50 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleting ? 'Deleting invitation...' : 'Permanently Delete Invitation'}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
