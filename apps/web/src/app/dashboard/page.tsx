'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Mail,
  Users,
  Calendar,
  ExternalLink,
  Search,
  Settings,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Edit3,
} from 'lucide-react';
import { clearAuth, getAccessToken, getCurrentUser } from '@/lib/auth';
import { fetchApi } from '@/lib/api/client';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { EditInvitationModal, InvitationData } from '@/components/dashboard/EditItemModals';

interface Invitation {
  _id: string;
  publicId: string;
  title: string;
  type: string;
  description?: string;
  location?: string;
  eventDate?: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const token = getAccessToken();

  const [email, setEmail] = useState('');
  const [items, setItems] = useState<Invitation[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Edit modal state
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    Promise.all([
      getCurrentUser(),
      fetchApi<Invitation[]>('/invitations', { token }),
    ])
      .then(async ([userRes, invRes]) => {
        if (!userRes.success || !invRes.success) {
          clearAuth();
          router.replace('/auth/login');
          return;
        }

        setEmail(userRes.data.email ?? '');
        setItems(invRes.data);

        // Fetch guest and event counts in parallel
        const guestEntries = await Promise.all(
          invRes.data.map(async (inv) => {
            const res = await fetchApi<unknown[]>(`/invitations/${inv._id}/guests`, { token });
            return [inv._id, res.success ? res.data.length : 0] as const;
          }),
        );
        setCounts(Object.fromEntries(guestEntries));

        const eventEntries = await Promise.all(
          invRes.data.map(async (inv) => {
            const res = await fetchApi<unknown[]>(`/invitations/${inv._id}/events`, { token });
            return [inv._id, res.success ? res.data.length : 0] as const;
          }),
        );
        setEventCounts(Object.fromEntries(eventEntries));
      })
      .catch(() => setError('Could not load creator invitations.'))
      .finally(() => setLoading(false));
  }, [router, token]);

  const handleUpdateInvitation = async (updated: Partial<InvitationData>) => {
    if (!editingInvitation) return;
    const res = await fetchApi<Invitation>(`/invitations/${editingInvitation._id}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify(updated),
    });
    if (!res.success) {
      throw new Error(res.error.message);
    }
    setItems((prev) =>
      prev.map((it) => (it._id === editingInvitation._id ? { ...it, ...res.data } : it)),
    );
  };

  const handleCopyPublicLink = async (invitation: Invitation) => {
    const url = `${window.location.origin}/invite/${invitation.publicId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(invitation._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered invitations list
  const filteredItems = useMemo(() => {
    return items.filter((inv) => {
      const matchesSearch =
        inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.location && inv.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const totalGuests = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalEvents = Object.values(eventCounts).reduce((a, b) => a + b, 0);
  const publishedCount = items.filter((x) => x.status === 'PUBLISHED').length;

  const getCelebrationBadge = (type: string) => {
    const types: Record<string, { label: string; class: string }> = {
      wedding: { label: 'Wedding', class: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
      birthday: { label: 'Birthday', class: 'border-pink-500/30 bg-pink-500/10 text-pink-300' },
      anniversary: { label: 'Anniversary', class: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
      engagement: { label: 'Engagement', class: 'border-indigo-500/30 bg-indigo-300/10 text-indigo-300' },
      party: { label: 'Party', class: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
      baby_shower: { label: 'Baby Shower', class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
      corporate: { label: 'Corporate', class: 'border-neutral-500/30 bg-neutral-500/10 text-neutral-300' },
    };
    const match = types[type.toLowerCase()] || {
      label: type,
      class: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${match.class}`}
      >
        {match.label}
      </span>
    );
  };

  return (
    <DashboardShell
      userEmail={email}
      title="Creator Studio"
      subtitle="Manage your bespoke invitations, schedule events, and personalized guest experiences."
      action={
        <Link
          href="/dashboard/invitations/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Invitation</span>
        </Link>
      }
    >
      {error && (
        <div className="mb-8 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300 backdrop-blur-xl">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <StatCard
          label="Total Invitations"
          value={items.length}
          subtitle="Celebrations created"
          icon={<Mail className="h-5 w-5" />}
        />
        <StatCard
          label="Total Guests"
          value={totalGuests}
          subtitle="Across all lists"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Published Live"
          value={publishedCount}
          subtitle="Active & shareable"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Total Events"
          value={totalEvents}
          subtitle="Ceremonies & parties"
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Action shortcuts & Search bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                statusFilter === tab
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {tab === 'ALL' ? 'All Invitations' : tab === 'PUBLISHED' ? 'Published' : 'Drafts'}
              <span className="ml-1.5 opacity-70">
                (
                {tab === 'ALL'
                  ? items.length
                  : tab === 'PUBLISHED'
                    ? publishedCount
                    : items.length - publishedCount}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search celebrations or venues..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Invitations Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-neutral-400 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
            <p className="text-sm font-medium">Loading your invitations...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
            <Mail className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No matching invitations found'
              : 'No invitations created yet'}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try changing your search terms or status filter tab above.'
              : 'Start your celebration experience by creating your first personalized digital invitation.'}
          </p>
          <Link
            href="/dashboard/invitations/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Invitation</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredItems.map((inv) => {
            const isPublished = inv.status === 'PUBLISHED';
            const guestCount = counts[inv._id] ?? 0;
            const eventCount = eventCounts[inv._id] ?? 0;

            return (
              <article
                key={inv._id}
                className="group relative flex flex-col justify-between rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900 hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div>
                  {/* Card Header: Type Badge & Status Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCelebrationBadge(inv.type)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPublished ? 'bg-emerald-400' : 'bg-neutral-500'
                        }`}
                      />
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          isPublished ? 'text-emerald-400' : 'text-neutral-500'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Date/Location */}
                  <div className="mt-4">
                    <h2 className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {inv.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-neutral-400">
                      {inv.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-400/80" />
                          {new Date(inv.eventDate).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}
                        </span>
                      )}
                      <span>
                        {inv.location || 'No location set'}
                      </span>
                    </div>
                  </div>

                  {/* Badges summary row */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <Link
                      href={`/dashboard/invitations/${inv._id}/guests`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/60 px-2.5 py-1 text-neutral-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                    >
                      <Users className="h-3.5 w-3.5 text-amber-400" />
                      <span>{guestCount} Guests</span>
                    </Link>
                    <Link
                      href={`/dashboard/invitations/${inv._id}/events`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/60 px-2.5 py-1 text-neutral-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>{eventCount} Events</span>
                    </Link>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-4 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/invitations/${inv._id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 font-semibold text-amber-300 hover:bg-amber-400/20 transition-all"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => setEditingInvitation(inv)}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all"
                      title="Edit invitation info"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <Link
                      href={`/dashboard/invitations/${inv._id}/settings`}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all"
                      title="Settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPublished ? (
                      <>
                        <button
                          onClick={() => handleCopyPublicLink(inv)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 transition-all"
                        >
                          {copiedId === inv._id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <Link
                          href={`/invite/${inv.publicId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-2.5 py-1.5 text-emerald-300 hover:bg-emerald-900/50 transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </Link>
                      </>
                    ) : (
                      <span className="text-[11px] text-neutral-500 italic">
                        Draft mode
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit Invitation Modal */}
      <EditInvitationModal
        isOpen={Boolean(editingInvitation)}
        onClose={() => setEditingInvitation(null)}
        invitation={editingInvitation}
        onSave={handleUpdateInvitation}
      />
    </DashboardShell>
  );
}
