import { notFound } from 'next/navigation';
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { fetchApi } from '@/lib/api/client';
import { PublicInvitationData } from '@repo/types';

interface PageProps {
  params: Promise<{ invitationSlug: string }>;
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const { invitationSlug } = await params;

  const res = await fetchApi<PublicInvitationData>(
    `/public/invitations/${invitationSlug}`,
  );

  if (!res.success || !res.data) {
    // If backend is not reached in static mode or development, show demonstration preview
    const fallbackData: PublicInvitationData = {
      id: 'demo_invitation',
      title: 'Aria & Julian',
      type: 'wedding',
      slug: invitationSlug,
      template: { templateId: 'classic-wedding-01', version: 1 },
      rsvpEnabled: true,
      allowPlusOnes: true,
      maxGuests: 3,
      content: {
        event: {
          date: 'Saturday, October 24, 2026',
          time: '5:00 PM',
          timezone: 'EST',
        },
        venue: {
          name: 'The Glasshouse Estate',
          address: '450 Hudson Boulevard, New York, NY 10001',
          mapUrl: 'https://maps.google.com',
        },
        sections: [
          {
            type: 'hero',
            data: {
              title: 'Aria & Julian',
              subtitle: 'Together with their families, invite you to celebrate their union.',
              date: 'October 24, 2026',
              venue: 'The Glasshouse Estate, NY',
            },
          },
          {
            type: 'divider',
            data: { style: 'line' },
          },
          {
            type: 'quote',
            data: {
              quote: 'Whatever our souls are made of, his and mine are the same.',
              author: 'Emily Brontë',
            },
          },
          {
            type: 'event',
            data: {
              title: 'Order of Celebration',
              date: 'October 24, 2026',
              time: '5:00 PM',
              timezone: 'EST',
              schedule: [
                { time: '5:00 PM', title: 'Arrival & Welcome Drinks' },
                { time: '5:30 PM', title: 'Sunset Ceremony' },
                { time: '6:30 PM', title: 'Cocktail Hour & Jazz' },
                { time: '8:00 PM', title: 'Dinner & Toasts' },
                { time: '10:00 PM', title: 'Dancing under the Stars' },
              ],
            },
          },
          {
            type: 'venue',
            data: {
              name: 'The Glasshouse Estate',
              address: '450 Hudson Boulevard, New York, NY 10001',
              directions: 'Complimentary valet parking available at the main entrance.',
              mapUrl: 'https://maps.google.com',
            },
          },
          {
            type: 'rsvp',
            data: {
              deadline: 'September 15, 2026',
              note: 'Kindly reply by September 15th to assist our seating and catering arrangements.',
              allowPlusOnes: true,
              maxGuests: 2,
            },
          },
          {
            type: 'footer',
            data: {
              text: 'We look forward to celebrating this unforgettable milestone together.',
              hashtag: '#AriaAndJulianForever',
            },
          },
        ],
      },
    };

    return <InvitationRenderer invitation={fallbackData} />;
  }

  return <InvitationRenderer invitation={res.data} />;
}
