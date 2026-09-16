import Link from 'next/link';
import { Button, Card, Badge } from '@repo/ui';
import {
  Sparkles,
  Users,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-amber-500/15 to-yellow-300/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-500/10 to-orange-400/5 blur-[140px]" />
        <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-neutral-900 bg-neutral-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 fill-neutral-950" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              Celebrato
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/auth/signup">
              <Button variant="gold" size="sm">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          The Modern Personalized Invitation Platform
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold font-serif tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
          One Master Invitation.{' '}
          <span className="text-gold-gradient">
            Personalized For Every Guest.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Distribute bespoke, digital celebration invitations with tailored names,
          private notes, custom RSVP quotas, and group capability tokens.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="gold" size="lg" className="gap-2">
              <span>Go to Creator Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/i/Ab72k" target="_blank">
            <Button variant="outline" size="lg" className="gap-2 border-neutral-700 text-neutral-200">
              <span>View Public Invitation</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Live Personalization Architecture Demonstration */}
        <section className="mt-20 text-left">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-800">
              <div>
                <Badge variant="gold" className="mb-2">
                  Interactive Differentiator Demo
                </Badge>
                <h3 className="text-2xl font-bold font-serif text-white">
                  Capability URLs in Action
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Click on any link below to test how different recipients receive personalized content from the exact same invitation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-emerald-400">
                  Live CDN Simulation
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              {/* Group 1: Family */}
              <Link href="/i/Ab72k/g/family" target="_blank" className="group">
                <Card hoverEffect className="h-full border-neutral-800 bg-neutral-950/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                      Group Link
                    </span>
                    <Badge variant="purple">Family</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    The Family Circle
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed">
                    Custom greeting for family members with 4 allocated headcount seats.
                  </p>
                  <div className="rounded-lg bg-neutral-900/80 p-2 text-[11px] font-mono text-neutral-300 flex items-center justify-between">
                    <span>/i/Ab72k/g/family</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Card>
              </Link>

              {/* Group 2: Friends */}
              <Link href="/i/Ab72k/g/friends" target="_blank" className="group">
                <Card hoverEffect className="h-full border-neutral-800 bg-neutral-950/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                      Group Link
                    </span>
                    <Badge variant="default">Friends</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Best Friends Crew
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed">
                    Personalized message for friends with relaxed dress code & schedule.
                  </p>
                  <div className="rounded-lg bg-neutral-900/80 p-2 text-[11px] font-mono text-neutral-300 flex items-center justify-between">
                    <span>/i/Ab72k/g/friends</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Card>
              </Link>

              {/* Individual Recipient */}
              <Link href="/i/Ab72k/p/X7a91" target="_blank" className="group">
                <Card hoverEffect className="h-full border-amber-500/40 bg-neutral-950/80 p-6 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                      Cryptographic Capability Token
                    </span>
                    <Badge variant="gold">VIP Individual</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Dr. Marcus Vance & Family
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed">
                    Personalized salutation, private note, and pre-bound RSVP token.
                  </p>
                  <div className="rounded-lg bg-neutral-900/80 p-2 text-[11px] font-mono text-amber-300 flex items-center justify-between">
                    <span>/i/Ab72k/p/X7a91</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-8">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">
              Data-Driven Sections
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Hero, Event details, Interactive Venue, Countdown, Quotes, Gallery,
              and RSVP. Fully responsive across smartphones, tablets, and desktops.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">
              Idempotent RSVP Engine
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Eliminate double-submissions with cryptographic capabilities. Guests can seamlessly accept, decline, or update their attendance anytime.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-8">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">
              CDN-First Caching
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Engineered to sustain viral spikes of 100,000+ guest visits with zero database exhaustion via intelligent public-safe edge caching.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 text-center text-xs text-neutral-500">
        <p>Celebrato &bull; Digital Invitation Platform &bull; Modular Monolith Architecture</p>
      </footer>
    </div>
  );
}
