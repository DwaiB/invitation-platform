'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth';

interface Invitation { _id: string; publicId: string; title: string; type: string; description?: string; location?: string; eventDate?: string; status: string }
interface EventItem { _id: string; title: string; date: string; startTime?: string; location?: string }
interface Group { _id: string; name: string }
interface Guest { _id: string; name: string; email?: string; personalNote?: string; groupId?: string }

export default function InvitationDetailsPage() {
  const params = useParams<{ id: string }>(); const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null); const [events, setEvents] = useState<EventItem[]>([]); const [groups, setGroups] = useState<Group[]>([]); const [guests, setGuests] = useState<Guest[]>([]); const [error, setError] = useState(''); const [publishing, setPublishing] = useState(false);
  const token = getAccessToken();

  async function load() {
    const [invitationResponse, eventsResponse, groupsResponse, guestsResponse] = await Promise.all([
      fetchApi<Invitation>(`/invitations/${params.id}`, { token: token ?? undefined }),
      fetchApi<EventItem[]>(`/invitations/${params.id}/events`, { token: token ?? undefined }),
      fetchApi<Group[]>(`/invitations/${params.id}/groups`, { token: token ?? undefined }),
      fetchApi<Guest[]>(`/invitations/${params.id}/guests`, { token: token ?? undefined }),
    ]);
    if (!invitationResponse.success) return setError(invitationResponse.error.message);
    setInvitation(invitationResponse.data); if (eventsResponse.success) setEvents(eventsResponse.data); if (groupsResponse.success) setGroups(groupsResponse.data); if (guestsResponse.success) setGuests(guestsResponse.data);
  }

  useEffect(() => { if (!token) router.replace('/auth/login'); else load(); }, [params.id]);

  async function publish() {
    if (!invitation) return; setPublishing(true); const response = await fetchApi<Invitation>(`/invitations/${invitation._id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify({ status: invitation.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }) }); setPublishing(false); if (response.success) setInvitation(response.data); else setError(response.error.message);
  }

  if (error) return <main className="min-h-screen bg-neutral-950 p-8 text-white"><p className="text-rose-400">{error}</p><Link href="/dashboard" className="mt-4 inline-block text-amber-300">Back to dashboard</Link></main>;
  if (!invitation) return <main className="min-h-screen bg-neutral-950 p-8 text-neutral-400">Loading invitation…</main>;
  const publicUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/invite/${invitation.publicId}`;

  return <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white"><div className="mx-auto max-w-6xl"><Link href="/dashboard" className="text-sm text-amber-300">← Dashboard</Link><div className="mt-8 flex flex-col justify-between gap-5 border-b border-neutral-800 pb-8 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><h1 className="text-4xl font-serif font-bold">{invitation.title}</h1><span className="rounded-full bg-neutral-800 px-3 py-1 text-xs">{invitation.status}</span></div><p className="mt-2 text-neutral-400">{invitation.location || 'No location'} {invitation.eventDate ? `· ${new Date(invitation.eventDate).toLocaleDateString()}` : ''}</p></div><div className="flex gap-3"><button onClick={publish} disabled={publishing} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950">{publishing ? 'Saving…' : invitation.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button>{invitation.status === 'PUBLISHED' && <a href={publicUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-neutral-700 px-4 py-2 text-sm">Preview</a>}</div></div><div className="mt-8 grid gap-5 md:grid-cols-3"><Panel title="Events" count={events.length}>{events.length ? events.map((event) => <div key={event._id} className="border-b border-neutral-800 py-3 last:border-0"><p className="font-medium">{event.title}</p><p className="text-xs text-neutral-400">{new Date(event.date).toLocaleDateString()} {event.startTime || ''}</p></div>) : <Empty text="No events yet" />}</Panel><Panel title="Guest groups" count={groups.length}>{groups.length ? groups.map((group) => <div key={group._id} className="border-b border-neutral-800 py-3 last:border-0">{group.name}</div>) : <Empty text="No groups yet" />}</Panel><Panel title="Guests" count={guests.length}>{guests.length ? guests.slice(0, 6).map((guest) => <div key={guest._id} className="border-b border-neutral-800 py-3 last:border-0"><p>{guest.name}</p><p className="text-xs text-neutral-500">{guest.email || 'No email'}</p></div>) : <Empty text="No guests yet" />}</Panel></div>{invitation.status === 'PUBLISHED' && <div className="mt-8 rounded-xl border border-emerald-900 bg-emerald-950/30 p-5"><p className="text-sm font-semibold text-emerald-300">Public link</p><p className="mt-2 break-all font-mono text-sm text-neutral-300">{publicUrl}</p></div>}</div></main>;
}

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) { return <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-xl font-bold">{title}</h2><span className="text-sm text-amber-300">{count}</span></div><div className="mt-4 text-sm text-neutral-200">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="py-4 text-sm text-neutral-500">{text}</p>; }
