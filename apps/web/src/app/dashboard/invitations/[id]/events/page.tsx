'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken, getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { EditEventModal, EventItemData } from '@/components/dashboard/EditItemModals';

interface Invitation {
  _id: string;
  title: string;
}

export default function EventsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = getAccessToken();

  const [userEmail, setUserEmail] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [events, setEvents] = useState<EventItemData[]>([]);
  const [form, setForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItemData | null>(null);

  async function loadData() {
    const [userRes, invRes, eventRes] = await Promise.all([
      getCurrentUser(),
      fetchApi<Invitation>(`/invitations/${id}`, { token: token ?? undefined }),
      fetchApi<EventItemData[]>(`/invitations/${id}/events`, { token: token ?? undefined }),
    ]);

    if (userRes.success) setUserEmail(userRes.data.email ?? '');
    if (invRes.success) setInvitation(invRes.data);
    if (eventRes.success) setEvents(eventRes.data);
    else setError(eventRes.error.message);
  }

  useEffect(() => {
    if (!token) router.replace('/auth/login');
    else loadData();
  }, [id, token]);

  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      setError('Event title and date are required.');
      return;
    }
    setSaving(true);
    setError('');

    const response = await fetchApi<EventItemData>(`/invitations/${id}/events`, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify({
        title: form.title.trim(),
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        location: form.location.trim() || undefined,
        description: form.description.trim() || undefined,
      }),
    });
    setSaving(false);

    if (!response.success) return setError(response.error.message);

    setEvents((current) =>
      [...current, response.data].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
    });
  }

  async function handleUpdateEvent(eventId: string, updated: Partial<EventItemData>) {
    const response = await fetchApi<EventItemData>(`/invitations/${id}/events/${eventId}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify(updated),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    setEvents((current) =>
      current
        .map((ev) => (ev._id === eventId ? response.data : ev))
        .sort((a, b) => a.date.localeCompare(b.date)),
    );
  }

  async function removeEvent(eventId: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This event will be removed from your invitation schedule.`))
      return;

    const response = await fetchApi(`/invitations/${id}/events/${eventId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    if (!response.success) return setError(response.error.message);
    setEvents((current) => current.filter((item) => item._id !== eventId));
  }

  return (
    <DashboardShell
      userEmail={userEmail}
      breadcrumbs={[
        { label: 'Creator Studio', href: '/dashboard' },
        { label: invitation?.title || 'Invitation', href: `/dashboard/invitations/${id}` },
        { label: 'Events & Schedule' },
      ]}
      title="Events & Schedule"
      subtitle="Craft ceremonies, dinner receptions, milestones, and parties for this invitation."
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300 backdrop-blur-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: List of Events */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <span>Itinerary Timeline</span>
            </h2>
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-amber-300">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">No events scheduled yet</h3>
              <p className="mt-1 max-w-sm text-xs text-neutral-400">
                Use the form on the right to add key dates, ceremonies, and timings for your guests.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((item, index) => (
                <article
                  key={item._id}
                  className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-xl transition-all hover:border-neutral-700 hover:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/10 text-xs font-bold text-amber-400">
                          {index + 1}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-300/90 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.date).toLocaleDateString(undefined, {
                            dateStyle: 'full',
                          })}
                        </span>
                        {(item.startTime || item.endTime) && (
                          <span className="flex items-center gap-1 text-neutral-300">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            {item.startTime}
                            {item.endTime ? ` – ${item.endTime}` : ''}
                          </span>
                        )}
                      </div>

                      {item.location && (
                        <p className="flex items-center gap-1 text-xs text-neutral-400">
                          <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <span>{item.location}</span>
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-2 text-xs text-neutral-300 leading-relaxed max-w-xl">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Action buttons (Edit, Delete) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingEvent(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-amber-500/40 hover:text-amber-300 hover:bg-neutral-900 transition-all"
                        title="Edit event details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => removeEvent(item._id, item.title)}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:border-rose-900 hover:bg-rose-950/40 transition-all"
                        title="Delete event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Add Event Form */}
        <aside>
          <form
            onSubmit={addEvent}
            className="sticky top-24 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <Plus className="h-5 w-5 text-amber-400" />
              <h2 className="font-serif text-xl font-bold text-white">Add New Event</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Event Title *
              </label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g., Cocktail Reception & Dinner"
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Date *
              </label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => updateForm('date', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Start Time
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateForm('startTime', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  End Time
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateForm('endTime', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Hall / Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="e.g., Grand Sapphire Ballroom"
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Event Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Dress code, agenda, special notes..."
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <button
              disabled={saving}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-3 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
            >
              {saving ? 'Adding Event...' : '+ Add Event to Schedule'}
            </button>
          </form>
        </aside>
      </div>

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        eventItem={editingEvent}
        onSave={handleUpdateEvent}
      />
    </DashboardShell>
  );
}
