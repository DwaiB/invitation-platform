'use client';

import * as React from 'react';
import { PublicInvitationData, InvitationSection, RSVPStatus } from '@repo/types';
import { Button, Card, Badge, Input } from '@repo/ui';
import { Calendar, Clock, MapPin, Heart, Sparkles, Send, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api/client';

export interface InvitationRendererProps {
  invitation: PublicInvitationData;
  isEditorPreview?: boolean;
}

export const InvitationRenderer: React.FC<InvitationRendererProps> = ({
  invitation,
  isEditorPreview = false,
}) => {
  const { content, recipient, group, slug } = invitation;
  const sections = content.sections || [];

  // Local RSVP state
  const [rsvpStatus, setRsvpStatus] = React.useState<RSVPStatus>(
    recipient?.rsvpStatus || 'pending',
  );
  const [guestCount, setGuestCount] = React.useState<number>(1);
  const [message, setMessage] = React.useState<string>('');
  const [guestName, setGuestName] = React.useState<string>(recipient?.name || '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = React.useState(
    Boolean(recipient?.rsvpStatus && recipient.rsvpStatus !== 'pending'),
  );

  const handleRSVPSubmit = async (
    status: 'accepted' | 'declined' | 'maybe' | 'pending',
  ) => {
    if (status === 'pending') {
      setRsvpStatus('pending');
      setRsvpSubmitted(false);
      return;
    }
    if (isEditorPreview) {
      setRsvpStatus(status);
      setRsvpSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = recipient?.token
        ? `/public/invitations/${slug}/p/${recipient.token}/rsvp`
        : `/public/invitations/${slug}/rsvp`;

      const res = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          status,
          guestCount,
          name: guestName,
          message,
        }),
      });

      if (res.success) {
        setRsvpStatus(status);
        setRsvpSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col items-center selection:bg-amber-400 selection:text-neutral-950">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-rose-500/10 blur-[120px]" />
      </div>

      {/* Recipient Personalization Banner */}
      {(recipient || group) && (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-900/80 border-b border-neutral-800/80 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2 text-amber-300 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              {recipient
                ? `Personalized for: ${recipient.salutation ? `${recipient.salutation} ` : ''}${recipient.name}`
                : `Invited as part of: ${group?.name}`}
            </span>
            <Badge variant="gold" className="text-[10px]">
              Exclusive Link
            </Badge>
          </div>
        </header>
      )}

      {/* Main Invitation Container */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-8 sm:py-16 space-y-12">
        {/* Recipient's personalized message if present */}
        {recipient?.message && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center backdrop-blur-md shadow-lg shadow-amber-500/5">
            <p className="text-sm uppercase tracking-widest text-amber-400 font-semibold mb-1">
              A Personal Note For You
            </p>
            <p className="text-lg text-amber-100 italic font-serif">"{recipient.message}"</p>
          </div>
        )}

        {/* Dynamic Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="transition-all duration-300">
            {renderSection(section, {
              invitation,
              rsvpState: {
                status: rsvpStatus,
                guestCount,
                setGuestCount,
                message,
                setMessage,
                guestName,
                setGuestName,
                isSubmitting,
                rsvpSubmitted,
                onSubmit: handleRSVPSubmit,
              },
            })}
          </div>
        ))}

        {/* Default RSVP component if rsvpEnabled is true and no rsvp section exists */}
        {invitation.rsvpEnabled && !sections.some((s) => s.type === 'rsvp') && (
          <div className="mt-12">
            {renderDefaultRSVP({
              invitation,
              status: rsvpStatus,
              guestCount,
              setGuestCount,
              message,
              setMessage,
              guestName,
              setGuestName,
              isSubmitting,
              rsvpSubmitted,
              onSubmit: handleRSVPSubmit,
            })}
          </div>
        )}
      </main>
    </div>
  );
};

interface SectionRenderContext {
  invitation: PublicInvitationData;
  rsvpState: {
    status: RSVPStatus;
    guestCount: number;
    setGuestCount: (n: number) => void;
    message: string;
    setMessage: (s: string) => void;
    guestName: string;
    setGuestName: (s: string) => void;
    isSubmitting: boolean;
    rsvpSubmitted: boolean;
    onSubmit: (status: 'accepted' | 'declined' | 'maybe' | 'pending') => void;
  };
}

function renderSection(section: InvitationSection, ctx: SectionRenderContext) {
  switch (section.type) {
    case 'hero':
      return (
        <div className="text-center space-y-4 py-8">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-amber-400/90 font-medium">
            You Are Cordially Invited
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-serif text-white">
            {section.data.title}
          </h1>
          {section.data.subtitle && (
            <p className="text-lg sm:text-xl text-neutral-400 max-w-md mx-auto font-light">
              {section.data.subtitle}
            </p>
          )}
          {(section.data.date || section.data.venue) && (
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-300">
              {section.data.date && (
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {section.data.date}
                </span>
              )}
              {section.data.venue && (
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {section.data.venue}
                </span>
              )}
            </div>
          )}
        </div>
      );

    case 'text':
      return (
        <div
          className={`py-4 px-2 text-${section.data.align || 'center'} text-neutral-300 leading-relaxed`}
        >
          {section.data.title && (
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              {section.data.title}
            </h3>
          )}
          <p className="text-base whitespace-pre-line">{section.data.body}</p>
        </div>
      );

    case 'event':
      return (
        <Card className="border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 backdrop-blur-xl">
          <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            {section.data.title || 'Event Details'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-neutral-400">Date</span>
              <p className="text-lg font-semibold text-neutral-100">{section.data.date}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-neutral-400">Time</span>
              <p className="text-lg font-semibold text-neutral-100">
                {section.data.time} ({section.data.timezone || 'Local Time'})
              </p>
            </div>
          </div>
          {section.data.schedule && section.data.schedule.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-800">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4">
                Schedule of Events
              </h4>
              <div className="space-y-4">
                {section.data.schedule.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-sm font-mono text-amber-400/90 whitespace-nowrap pt-0.5">
                      {item.time}
                    </span>
                    <div>
                      <h5 className="text-sm font-medium text-white">{item.title}</h5>
                      {item.description && (
                        <p className="text-xs text-neutral-400">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      );

    case 'venue':
      return (
        <Card className="border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 backdrop-blur-xl">
          <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            {section.data.name}
          </h3>
          <p className="text-neutral-300 leading-relaxed">{section.data.address}</p>
          {section.data.directions && (
            <p className="text-sm text-neutral-400 mt-2 italic">{section.data.directions}</p>
          )}
          {section.data.mapUrl && (
            <a
              href={section.data.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
            >
              Get Directions &rarr;
            </a>
          )}
        </Card>
      );

    case 'quote':
      return (
        <div className="text-center py-6 px-4">
          <blockquote className="text-xl sm:text-2xl font-serif italic text-amber-200/90 leading-relaxed">
            "{section.data.quote}"
          </blockquote>
          {section.data.author && (
            <cite className="block text-sm text-neutral-400 mt-2 font-normal not-italic">
              &mdash; {section.data.author}
            </cite>
          )}
        </div>
      );

    case 'divider':
      return (
        <div className="flex items-center justify-center py-6">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <Heart className="w-4 h-4 text-amber-500/70 mx-3 fill-amber-500/30" />
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>
      );

    case 'rsvp':
      return renderDefaultRSVP({
        invitation: ctx.invitation,
        deadline: section.data.deadline,
        note: section.data.note,
        status: ctx.rsvpState.status,
        guestCount: ctx.rsvpState.guestCount,
        setGuestCount: ctx.rsvpState.setGuestCount,
        message: ctx.rsvpState.message,
        setMessage: ctx.rsvpState.setMessage,
        guestName: ctx.rsvpState.guestName,
        setGuestName: ctx.rsvpState.setGuestName,
        isSubmitting: ctx.rsvpState.isSubmitting,
        rsvpSubmitted: ctx.rsvpState.rsvpSubmitted,
        onSubmit: ctx.rsvpState.onSubmit,
      });

    case 'footer':
      return (
        <footer className="text-center py-8 border-t border-neutral-900 text-neutral-500 text-xs space-y-2">
          {section.data.text && <p>{section.data.text}</p>}
          {section.data.hashtag && (
            <p className="font-mono text-amber-400 font-semibold text-sm">
              #{section.data.hashtag.replace(/^#/, '')}
            </p>
          )}
          <p className="text-[10px] text-neutral-600 pt-4">
            Delivered with Celebrato &bull; Personalized Digital Invitations
          </p>
        </footer>
      );

    default:
      return null;
  }
}

function renderDefaultRSVP(props: {
  invitation: PublicInvitationData;
  deadline?: string;
  note?: string;
  status: RSVPStatus;
  guestCount: number;
  setGuestCount: (n: number) => void;
  message: string;
  setMessage: (s: string) => void;
  guestName: string;
  setGuestName: (s: string) => void;
  isSubmitting: boolean;
  rsvpSubmitted: boolean;
  onSubmit: (status: 'accepted' | 'declined' | 'maybe' | 'pending') => void;
}) {
  const {
    deadline,
    note,
    status,
    guestCount,
    setGuestCount,
    message,
    setMessage,
    guestName,
    setGuestName,
    isSubmitting,
    rsvpSubmitted,
    onSubmit,
  } = props;

  return (
    <Card className="border-amber-500/30 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl shadow-amber-500/5">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-2xl font-serif font-bold text-white">Will You Attend?</h3>
        {deadline && (
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
            Please RSVP by {deadline}
          </p>
        )}
        {note && <p className="text-sm text-neutral-400">{note}</p>}
      </div>

      {rsvpSubmitted ? (
        <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-6 text-center space-y-3">
          {status === 'accepted' ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <h4 className="text-lg font-bold text-white">You're on the Guest List!</h4>
              <p className="text-sm text-neutral-400">
                We're excited to celebrate with you. You indicated {guestCount} guest(s).
              </p>
            </div>
          ) : status === 'declined' ? (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="w-12 h-12 text-rose-400" />
              <h4 className="text-lg font-bold text-white">We'll Miss You!</h4>
              <p className="text-sm text-neutral-400">
                Thank you for letting us know. Warmest thoughts from afar.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <HelpCircle className="w-12 h-12 text-amber-400" />
              <h4 className="text-lg font-bold text-white">Response Noted</h4>
              <p className="text-sm text-neutral-400">
                You selected "Maybe". Feel free to update when your plans confirm!
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSubmit('pending')}
            className="mt-2 text-xs"
          >
            Change Response
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {!props.invitation.recipient?.name && (
            <Input
              label="Your Full Name"
              placeholder="e.g. Eleanor Vance"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          )}

          {props.invitation.allowPlusOnes && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wide uppercase text-neutral-300">
                Number of Guests Attending (including yourself)
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {[...Array(props.invitation.maxGuests || 4)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold tracking-wide uppercase text-neutral-300">
              Personal Message or Wishes (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the hosts..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button
              variant="gold"
              isLoading={isSubmitting}
              onClick={() => onSubmit('accepted')}
              className="w-full text-xs sm:text-sm"
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              isLoading={isSubmitting}
              onClick={() => onSubmit('maybe')}
              className="w-full text-xs sm:text-sm"
            >
              Maybe
            </Button>
            <Button
              variant="outline"
              isLoading={isSubmitting}
              onClick={() => onSubmit('declined')}
              className="w-full text-xs sm:text-sm hover:border-rose-500 hover:text-rose-400"
            >
              Decline
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
