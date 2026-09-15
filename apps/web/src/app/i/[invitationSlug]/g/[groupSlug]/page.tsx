import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { fetchApi } from '@/lib/api/client';
import { PublicInvitationData } from '@repo/types';

interface PageProps {
  params: Promise<{ invitationSlug: string; groupSlug: string }>;
}

export default async function GroupInvitationPage({ params }: PageProps) {
  const { invitationSlug, groupSlug } = await params;

  const res = await fetchApi<PublicInvitationData>(
    `/public/invitations/${invitationSlug}/g/${groupSlug}`,
  );

  if (!res.success || !res.data) {
    const formattedGroup = groupSlug.charAt(0).toUpperCase() + groupSlug.slice(1);
    const fallbackData: PublicInvitationData = {
      id: 'demo_invitation',
      title: 'Aria & Julian',
      type: 'wedding',
      slug: invitationSlug,
      template: { templateId: 'classic-wedding-01', version: 1 },
      group: {
        name: `${formattedGroup} Circle`,
        slug: groupSlug,
      },
      rsvpEnabled: true,
      allowPlusOnes: true,
      maxGuests: 4,
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
              subtitle: `To our cherished ${formattedGroup} members: We can't wait to celebrate with you!`,
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
              title: 'Event Schedule',
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
              note: `Please confirm your ${formattedGroup} party headcount below.`,
              allowPlusOnes: true,
              maxGuests: 4,
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
