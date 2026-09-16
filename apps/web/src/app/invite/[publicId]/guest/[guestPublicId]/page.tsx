import Link from 'next/link';

interface PersonalizedInvitation {
  invitation: { title: string; description?: string; location?: string; eventDate?: string };
  events: Array<{ title: string; date: string; startTime?: string; location?: string }>;
  guest: { name: string; personalNote?: string; status: string };
}

async function getInvitation(publicId: string, guestPublicId: string): Promise<PersonalizedInvitation> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const response = await fetch(`${base}/public/invitations/${publicId}/guests/${guestPublicId}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Invitation not found');
  const result = await response.json();
  return result.data;
}

export default async function PersonalizedInvitationPage({ params }: { params: Promise<{ publicId: string; guestPublicId: string }> }) {
  try {
    const { publicId, guestPublicId } = await params;
    const data = await getInvitation(publicId, guestPublicId);
    return <main className="min-h-screen bg-[#f7f1e8] px-5 py-16 text-stone-900"><article className="mx-auto max-w-2xl rounded-[2rem] bg-white px-6 py-16 text-center shadow-xl sm:px-16"><p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Dear {data.guest.name}</p><h1 className="mt-6 font-serif text-5xl font-bold sm:text-6xl">{data.invitation.title}</h1>{data.guest.personalNote && <p className="mx-auto mt-8 max-w-lg text-lg italic leading-8 text-stone-600">{data.guest.personalNote}</p>}{data.invitation.description && <p className="mx-auto mt-6 max-w-lg leading-8 text-stone-600">{data.invitation.description}</p>}<div className="my-10 h-px bg-amber-200" /><div className="space-y-2 text-stone-700">{data.invitation.eventDate && <p>{new Date(data.invitation.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>}{data.invitation.location && <p>{data.invitation.location}</p>}</div>{data.events.length > 0 && <section className="mt-12 text-left"><h2 className="text-center font-serif text-2xl font-bold">Events</h2><div className="mt-6 space-y-4">{data.events.map((event) => <div key={`${event.title}-${event.date}`} className="rounded-xl bg-amber-50 p-5"><h3 className="font-semibold">{event.title}</h3><p className="mt-1 text-sm text-stone-600">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}{event.startTime ? ` · ${event.startTime}` : ''}</p>{event.location && <p className="mt-1 text-sm text-stone-600">{event.location}</p>}</div>)}</div></section>}<p className="mt-12 font-serif text-xl text-stone-700">We hope to celebrate with you.</p></article><p className="mx-auto mt-6 max-w-2xl text-center text-xs text-stone-500"><Link href={`/invite/${publicId}`} className="hover:text-stone-800">View general invitation</Link></p></main>;
  } catch {
    return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-center text-white"><div><h1 className="text-3xl font-serif">Invitation unavailable</h1><p className="mt-3 text-neutral-400">This personalized link is invalid or expired.</p><Link href="/" className="mt-6 inline-block text-amber-300">Return home</Link></div></main>;
  }
}
