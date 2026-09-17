'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Users,
  Settings,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  FileText,
} from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken, getCurrentUser } from '@/lib/auth';
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

interface EventItem {
  _id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

interface Group {
  _id: string;
  name: string;
}

interface Guest {
  _id: string;
  publicId: string;
  name: string;
  email?: string;
  personalNote?: string;
  groupId?: string;
}

export default function InvitationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = getAccessToken();

  const [userEmail, setUserEmail] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function loadData() {
    const [userRes, invRes, eventsRes, groupsRes, guestsRes] = await Promise.all([
      getCurrentUser(),
      fetchApi<Invitation>(`/invitations/${params.id}`, { token: token ?? undefined }),
      fetchApi<EventItem[]>(`/invitations/${params.id}/events`, { token: token ?? undefined }),
      fetchApi<Group[]>(`/invitations/${params.id}/groups`, { token: token ?? undefined }),
      fetchApi<Guest[]>(`/invitations/${params.id}/guests`, { token: token ?? undefined }),
    ]);

    if (userRes.success) setUserEmail(userRes.data.email ?? '');
    if (!invRes.success) return setError(invRes.error.message);

    setInvitation(invRes.data);
    if (eventsRes.success) setEvents(eventsRes.data);
    if (groupsRes.success) setGroups(groupsRes.data);
    if (guestsRes.success) setGuests(guestsRes.data);
  }

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    loadData();
  }, [params.id, token]);

  const handleUpdateInvitation = async (updated: Partial<InvitationData>) => {
    if (!invitation) return;
    const res = await fetchApi<Invitation>(`/invitations/${invitation._id}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify(updated),
    });
    if (!res.success) {
      throw new Error(res.error.message);
    }
    setInvitation(res.data);
  };

  async function togglePublish() {
    if (!invitation) return;
    setPublishing(true);
    const nextStatus = invitation.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const response = await fetchApi<Invitation>(`/invitations/${invitation._id}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify({ status: nextStatus }),
    });
    setPublishing(false);
    if (response.success) {
      setInvitation(response.data);
    } else {
      setError(response.error.message);
    }
  }

  const handleCopyLink = async () => {
    if (!invitation) return;
    const publicUrl = `${window.location.origin}/invite/${invitation.publicId}`;
    await navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (error) {
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
            <p className="text-sm">Loading invitation details...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const publicUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/invite/${invitation.publicId}`;
  const isPublished = invitation.status === 'PUBLISHED';

  return (
    <DashboardShell
      userEmail={userEmail}
      breadcrumbs={[
        { label: 'Creator Studio', href: '/dashboard' },
        { label: 'Invitations', href: '/dashboard/invitations' },
        { label: invitation.title },
      ]}
    >
      {/* Top Details Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                {invitation.type}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isPublished
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPublished ? 'bg-emerald-400' : 'bg-neutral-500'
                  }`}
                />
                {invitation.status}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {invitation.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-neutral-400">
              {invitation.eventDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  {new Date(invitation.eventDate).toLocaleDateString(undefined, {
                    dateStyle: 'long',
                  })}
                </span>
              )}
              {invitation.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  {invitation.location}
                </span>
              )}
            </div>

            {invitation.description && (
              <p className="mt-2 text-sm text-neutral-300 max-w-2xl leading-relaxed italic">
                &ldquo;{invitation.description}&rdquo;
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/90 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5 text-amber-400" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={togglePublish}
              disabled={publishing}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-md transition-all active:scale-95 ${
                isPublished
                  ? 'border border-amber-500/40 bg-neutral-900 text-amber-300 hover:bg-amber-500/10'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-105 shadow-amber-500/20'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {publishing
                  ? 'Saving...'
                  : isPublished
                    ? 'Unpublish Live'
                    : 'Publish Live'}
              </span>
            </button>

            <Link
              href={`/dashboard/invitations/${invitation._id}/settings`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800/90 p-2.5 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Public Share Banner */}
        {isPublished && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Public Invitation Active
                </p>
                <p className="font-mono text-xs text-neutral-300 mt-0.5 truncate max-w-sm sm:max-w-md">
                  {publicUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-800/60 bg-emerald-900/40 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-900/70 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Preview</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3 Main Management Columns: Events, Groups, Guests */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Events Panel */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <h2 className="font-serif text-xl font-bold text-white">Events</h2>
              </div>
              <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                {events.length}
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {events.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-500">
                  No events added yet. Add ceremonies, parties, and milestones.
                </p>
              ) : (
                events.map((event) => (
                  <div
                    key={event._id}
                    className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 transition-all hover:border-neutral-700"
                  >
                    <p className="font-semibold text-sm text-neutral-100">{event.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      {event.startTime && <span>&bull; {event.startTime}</span>}
                      {event.location && <span>&bull; {event.location}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/invitations/${invitation._id}/events`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:border-amber-500/40 hover:bg-neutral-900 transition-all"
          >
            <span>Manage & Add Events</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Guest Groups Panel */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-400" />
                <h2 className="font-serif text-xl font-bold text-white">Guest Groups</h2>
              </div>
              <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                {groups.length}
              </span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {groups.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-500">
                  No custom groups yet. Group guests by Family, Friends, VIP, etc.
                </p>
              ) : (
                groups.map((group) => {
                  const memberCount = guests.filter((g) => g.groupId === group._id).length;
                  return (
                    <div
                      key={group._id}
                      className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 transition-all hover:border-neutral-700"
                    >
                      <span className="font-medium text-sm text-neutral-200">
                        {group.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {memberCount} guests
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/invitations/${invitation._id}/guests`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:border-amber-500/40 hover:bg-neutral-900 transition-all"
          >
            <span>Manage Groups</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Guests Panel */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                <h2 className="font-serif text-xl font-bold text-white">Guests</h2>
              </div>
              <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                {guests.length}
              </span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {guests.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-500">
                  No guests added yet. Add recipients to get personalized invitation links.
                </p>
              ) : (
                guests.slice(0, 6).map((guest) => (
                  <div
                    key={guest._id}
                    className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 transition-all hover:border-neutral-700"
                  >
                    <div>
                      <p className="font-medium text-sm text-neutral-100">{guest.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                        {guest.email || 'No email'}
                      </p>
                    </div>
                    {guest.personalNote && (
                      <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-md">
                        Note
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/invitations/${invitation._id}/guests`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:border-amber-500/40 hover:bg-neutral-900 transition-all"
          >
            <span>Manage & Add Guests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      {/* Edit Details Modal */}
      <EditInvitationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        invitation={invitation}
        onSave={handleUpdateInvitation}
      />
    </DashboardShell>
  );
}
