'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Badge, Input } from '@repo/ui';
import {
  Sparkles,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Users,
  Calendar,
  Eye,
  Settings,
  Heart,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Invitation } from '@repo/types';

export default function DashboardPage() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Initial invitation list (simulated creator invitations or fetched from API)
  const invitations: Invitation[] = [
    {
      _id: 'inv_7xK92',
      ownerId: 'user_123',
      type: 'wedding',
      title: 'Aria & Julian',
      slug: 'Ab72k',
      template: {
        templateId: 'classic-wedding-01',
        version: 1,
      },
      content: {
        couple: {
          name1: 'Aria',
          name2: 'Julian',
        },
        event: {
          date: 'Saturday, October 24, 2026',
          time: '18:00',
          timezone: 'EST',
        },
        venue: {
          name: 'The Glasshouse Estate',
          address: '450 Hudson Boulevard, New York, NY',
        },
        sections: [],
      },
      settings: {
        published: true,
        rsvpEnabled: true,
        allowPlusOnes: true,
        maxGuestsPerInvite: 2,
      },
      status: 'published',
      createdAt: '2026-09-01T12:00:00Z',
      updatedAt: '2026-09-10T14:30:00Z',
    },
    {
      _id: 'inv_9pL33',
      ownerId: 'user_123',
      type: 'birthday',
      title: 'Leo’s 30th Birthday Bash',
      slug: 'leo30',
      template: {
        templateId: 'modern-birthday-01',
        version: 1,
      },
      content: {
        honoree: {
          name: 'Leo',
          age: 30,
        },
        event: {
          date: 'Friday, November 14, 2026',
          time: '20:00',
          timezone: 'EST',
        },
        venue: {
          name: 'Skyline Rooftop Lounge',
          address: '775 8th Avenue, New York, NY',
        },
        sections: [],
      },
      settings: {
        published: true,
        rsvpEnabled: true,
      },
      status: 'published',
      createdAt: '2026-09-12T10:00:00Z',
      updatedAt: '2026-09-12T10:00:00Z',
    },
  ];

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/i/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Navigation */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold">
                <Sparkles className="w-4 h-4 fill-neutral-950" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Celebrato
              </span>
            </Link>
            <span className="text-xs font-mono text-neutral-500 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Public Home
            </Link>
            <Button variant="gold" size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create Invitation</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">
              Creator Studio
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Manage your master invitations, personalized recipient lists, and real-time RSVPs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="gold" className="text-xs">
              Personalized Delivery Active
            </Badge>
          </div>
        </div>

        {/* Aggregate Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-neutral-800 bg-neutral-900/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Invitations
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-white">2</span>
              <Badge variant="default">Active</Badge>
            </div>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              RSVP Confirmed
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-emerald-400">72</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400/80" />
            </div>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Pending Replies
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-amber-400">36</span>
              <Clock className="w-5 h-5 text-amber-400/80" />
            </div>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Guest Headcount
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-white">128</span>
              <Users className="w-5 h-5 text-neutral-400" />
            </div>
          </Card>
        </div>

        {/* Invitations List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Your Invitations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invitations.map((inv) => (
              <Card
                key={inv._id}
                hoverEffect
                className="border-neutral-800 bg-neutral-900/80 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" className="text-[10px]">
                        {inv.type}
                      </Badge>
                      <Badge variant={inv.status === 'published' ? 'success' : 'default'} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </div>
                    <span className="text-xs font-mono text-neutral-500">
                      Slug: /{inv.slug}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white hover:text-amber-300 transition-colors">
                    {inv.title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-neutral-400">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {inv.content.event.date} at {inv.content.event.time}
                    </p>
                    <p className="text-neutral-400">
                      Venue: {inv.content.venue.name}
                    </p>
                  </div>
                </div>

                {/* Capability Links Bar */}
                <div className="mt-6 pt-5 border-t border-neutral-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(inv.slug, inv._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                    >
                      {copiedId === inv._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copy Base URL</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link href={`/i/${inv.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-neutral-700">
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </Button>
                      </Link>
                      <Link href={`/i/${inv.slug}/p/X7a91`} target="_blank">
                        <Button variant="gold" size="sm" className="h-8 text-xs gap-1">
                          <Users className="w-3 h-3" />
                          <span>Guest Links</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
