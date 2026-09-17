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
  Clock,
  Layers,
  Copy,
  Check,
  Edit3,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { clearAuth, getAccessToken, getCurrentUser } from '@/lib/auth';
import { fetchApi } from '@/lib/api/client';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
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

export default function InvitationsHubPage() {
  const router = useRouter();
  const token = getAccessToken();

  const [email, setEmail] = useState('');
  const [items, setItems] = useState<Invitation[]>([]);
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Active modal
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

        // Fetch counts in parallel
        const [guestResList, eventResList, groupResList] = await Promise.all([
          Promise.all(
            invRes.data.map(async (inv) => {
              const res = await fetchApi<unknown[]>(`/invitations/${inv._id}/guests`, { token });
              return [inv._id, res.success ? res.data.length : 0] as const;
            }),
          ),
          Promise.all(
            invRes.data.map(async (inv) => {
              const res = await fetchApi<unknown[]>(`/invitations/${inv._id}/events`, { token });
              return [inv._id, res.success ? res.data.length : 0] as const;
            }),
          ),
          Promise.all(
            invRes.data.map(async (inv) => {
              const res = await fetchApi<unknown[]>(`/invitations/${inv._id}/groups`, { token });
              return [inv._id, res.success ? res.data.length : 0] as const;
            }),
          ),
        ]);

        setGuestCounts(Object.fromEntries(guestResList));
        setEventCounts(Object.fromEntries(eventResList));
        setGroupCounts(Object.fromEntries(groupResList));
      })
      .catch(() => setError('Could not load invitations list.'))
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

  const handleTogglePublish = async (invitation: Invitation) => {
    setTogglingId(invitation._id);
    const nextStatus = invitation.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await fetchApi<Invitation>(`/invitations/${invitation._id}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify({ status: nextStatus }),
    });
    setTogglingId(null);
    if (res.success) {
      setItems((prev) =>
        prev.map((it) => (it._id === invitation._id ? { ...it, status: nextStatus } : it)),
      );
    } else {
      setError(res.error.message);
    }
  };

  const handleCopyLink = async (invitation: Invitation) => {
    const url = `${window.location.origin}/invite/${invitation.publicId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(invitation._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered
  const filteredItems = useMemo(() => {
    return items.filter((inv) => {
      const matchesSearch =
        inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.location && inv.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter;
      const matchesType =
        typeFilter === 'ALL' || inv.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [items, searchQuery, statusFilter, typeFilter]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.type.toLowerCase())));
  }, [items]);

  return (
    <DashboardShell
      userEmail={email}
      breadcrumbs={[
        { label: 'Creator Studio', href: '/dashboard' },
        { label: 'All Invitations' },
      ]}
      title="Invitations Hub"
      subtitle="Manage your complete collection of invitations, events, guest lists, and groups."
      action={
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invitations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create Invitation</span>
          </Link>
        </div>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Quick Access Action Bar */}
      <div className="mb-8 rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Quick Management Shortcuts
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Select any invitation below to instantly add and edit events, guests, or groups.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Pills */}
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
              {tab === 'ALL' ? 'All' : tab === 'PUBLISHED' ? 'Published' : 'Drafts'}
            </button>
          ))}

          {uniqueTypes.length > 0 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invitations by name or location..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Invitations List / Cards */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-neutral-400 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
            <p className="text-sm font-medium">Loading invitations hub...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
            <Mail className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white">No invitations found</h3>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            Create an invitation to begin adding ceremonies, guests, and custom groups.
          </p>
          <Link
            href="/dashboard/invitations/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invitation</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((inv) => {
            const isPublished = inv.status === 'PUBLISHED';
            const guestCount = guestCounts[inv._id] ?? 0;
            const eventCount = eventCounts[inv._id] ?? 0;
            const groupCount = groupCounts[inv._id] ?? 0;

            return (
              <div
                key={inv._id}
                className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-xl transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  {/* Left Column: Info & Badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {inv.type}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isPublished
                            ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isPublished ? 'bg-emerald-400' : 'bg-neutral-500'
                          }`}
                        />
                        {inv.status}
                      </span>
                      {inv.eventDate && (
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-amber-400" />
                          {new Date(inv.eventDate).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}
                        </span>
                      )}
                      {inv.location && (
                        <span className="text-xs text-neutral-400">
                          &bull; {inv.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {inv.title}
                    </h3>
                  </div>

                  {/* Right Column: Direct Jump Buttons (Events, Guests, Groups, Details) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/invitations/${inv._id}/events`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-amber-500/50 hover:text-amber-300 hover:bg-neutral-900 transition-all"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Events ({eventCount})</span>
                      <Plus className="h-3 w-3 opacity-60 ml-0.5" />
                    </Link>

                    <Link
                      href={`/dashboard/invitations/${inv._id}/guests`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-amber-500/50 hover:text-amber-300 hover:bg-neutral-900 transition-all"
                    >
                      <Users className="h-3.5 w-3.5 text-amber-400" />
                      <span>Guests ({guestCount})</span>
                      <Plus className="h-3 w-3 opacity-60 ml-0.5" />
                    </Link>

                    <button
                      onClick={() => setEditingInvitation(inv)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all"
                      title="Edit invitation details"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      disabled={togglingId === inv._id}
                      onClick={() => handleTogglePublish(inv)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        isPublished
                          ? 'border border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                          : 'bg-amber-400 text-neutral-950 font-semibold hover:brightness-105'
                      }`}
                    >
                      {togglingId === inv._id
                        ? 'Saving...'
                        : isPublished
                          ? 'Unpublish'
                          : 'Publish'}
                    </button>

                    <Link
                      href={`/dashboard/invitations/${inv._id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-neutral-800 p-2 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all"
                      title="Open full invitation studio"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Additional bottom options if published */}
                {isPublished && (
                  <div className="mt-4 flex flex-wrap items-center justify-between border-t border-neutral-800/60 pt-3 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-neutral-500 truncate max-w-xs sm:max-w-md">
                        /invite/{inv.publicId}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCopyLink(inv)}
                        className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-amber-300 transition-colors"
                      >
                        {copiedId === inv._id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy link</span>
                          </>
                        )}
                      </button>
                      <Link
                        href={`/invite/${inv.publicId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open preview</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
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
