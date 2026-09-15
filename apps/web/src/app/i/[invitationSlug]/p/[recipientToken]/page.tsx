import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { fetchApi } from '@/lib/api/client';
import { PublicInvitationData } from '@repo/types';

interface PageProps {
  params: Promise<{ invitationSlug: string; recipientToken: string }>;
}

export default async function PersonalizedInvitationPage({ params }: PageProps) {
  const { invitationSlug, recipientToken } = await params;

  const res = await fetchApi<PublicInvitationData>(
    `/public/invitations/${invitationSlug}/p/${recipientToken}`,
  );

  if (!res.success || !res.data) {
    // Demonstration fallback for previewing personalized delivery
    const fallbackData: PublicInvitationData = {
      id: 'demo_invitation',
      title: 'Aria & Julian',
      type: 'wedding',
      slug: invitationSlug,
      template: { templateId: 'classic-wedding-01', version: 1 },
      recipient: {
        name: 'Dr. Marcus Vance & Family',
        token: recipientToken,
        salutation: 'Dear',
        message: 'Marcus, we couldn’t imagine taking this step without you by our side. We have reserved 2 seats in honor of your presence.',
        rsvpStatus: 'pending',
      },
      rsvpEnabled: true,
      allowPlusOnes: true,
      maxGuests: 2,
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
            type: 'event',
            data: {
              title: 'Celebration Schedule',
              date: 'October 24, 2026',
              time: '5:00 PM',
              timezone: 'EST',
            },
          },
          {
            type: 'venue',
            data: {
              name: 'The Glasshouse Estate',
              address: '450 Hudson Boulevard, New York, NY 10001',
            },
          },
          {
            type: 'rsvp',
            data: {
              deadline: 'September 15, 2026',
              note: 'Please RSVP at your earliest convenience.',
              allowPlusOnes: true,
              maxGuests: 2,
            },
          },
          {
            type: 'footer',
            data: {
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
