'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock3, MapPinned, MessagesSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getClientProjectVersion } from '@/actions/version';
import { useToast } from '@/hooks/use-toast';

const heroCopy = [
  'One place for your plans, notes, photos, and next trip.',
  'Built for couples who want something simple, calm, and shared.',
];

const benefits = [
  {
    title: 'Stay on the same page',
    body: 'Shared notes, a live countdown, and quick updates help both of you keep up without extra effort.',
    icon: MessagesSquare,
  },
  {
    title: 'Plan the next meetup',
    body: 'Track time until your next trip and get date ideas that actually match your schedule and interests.',
    icon: Clock3,
  },
  {
    title: 'Keep the good stuff together',
    body: 'Save photos and moments in one place so they are easy to revisit any time.',
    icon: MapPinned,
  },
];

const steps = [
  'Create an account and invite your partner.',
  'Add your next meetup date, notes, and favorite moments.',
  'Use the shared space to keep planning and checking in together.',
];

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_40px_120px_-70px_rgba(169,64,100,0.9)] sm:p-7"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(169,64,100,0.28),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,231,236,0.16),transparent_40%)]" />
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading text-2xl text-white">Couplesna</p>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Shared home for two</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            Live sync
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.15fr,0.85fr]">
          <div className="rounded-[1.7rem] border border-white/10 bg-black/25 p-5">
            <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/50">
              <span>Next meetup</span>
              <span>Updated today</span>
            </div>
            <p className="font-heading text-5xl leading-none text-white sm:text-6xl">18d</p>
            <p className="mt-3 text-sm text-white/60">Flights saved, countdown running, both of you seeing the same plan.</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-2">
                <span className="h-9 w-9 rounded-full bg-[#f3b9c8]/30" />
                <div>
                  <p className="text-sm text-white">Ava</p>
                  <p className="text-xs text-white/45">Kolkata</p>
                </div>
              </div>
              <motion.div
                animate={{ scaleX: [0.72, 1, 0.72], opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="h-[2px] flex-1 origin-center rounded-full bg-gradient-to-r from-[#f3b9c8]/35 via-primary to-[#f6d7de]/35"
              />
              <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-2">
                <div className="text-right">
                  <p className="text-sm text-white">Noah</p>
                  <p className="text-xs text-white/45">Berlin</p>
                </div>
                <span className="h-9 w-9 rounded-full bg-white/15" />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.7rem] border border-white/10 bg-[#100d10]/85 p-5">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
                <Sparkles className="h-4 w-4 text-primary" />
                Smart ideas
              </div>
              <p className="text-lg text-white">Movie night + dinner delivery</p>
              <p className="mt-2 text-sm text-white/55">Quick plans for weeknights, weekends, or the next visit.</p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
                <MessagesSquare className="h-4 w-4 text-primary" />
                Shared notes
              </div>
              <div className="space-y-3 text-sm text-white/68">
                <div className="rounded-2xl bg-white/5 px-4 py-3">Book the cafe near the station on Saturday.</div>
                <div className="rounded-2xl bg-primary/14 px-4 py-3 text-white">Saved. I also added the train time.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, supabaseReady } = useAppContext();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [version, setVersion] = React.useState('...');

  React.useEffect(() => {
    getClientProjectVersion().then(setVersion);
  }, []);

  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  const handleAuthError = (error: unknown) => {
    toast({
      variant: 'destructive',
      title: 'Authentication failed',
      description: error instanceof Error ? error.message : 'Unable to complete authentication.',
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#09070a] text-foreground selection:bg-primary/20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-[10%] top-[-8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(169,64,100,0.24),transparent_62%)] blur-[110px]"
        />
        <motion.div
          animate={{ x: [0, -16, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[-8%] top-[14%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,226,233,0.11),transparent_60%)] blur-[100px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,7,10,0.2),rgba(8,7,10,0.86))]" />
      </div>

      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:24px_24px]" />

      <section className="relative isolate overflow-hidden border-b border-white/6">
        <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <div className="group flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:scale-105 group-hover:border-primary/40">
              <Image src="/couplesna_favicon.png" alt="Couplesna" width={24} height={24} />
            </div>
            <div>
              <p className="font-heading text-[1.9rem] tracking-tight text-white">Couplesna</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">Long-distance made easier</p>
            </div>
          </div>

          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <div className="flex items-center gap-4">
              <DialogTrigger asChild>
                <button className="hidden text-sm font-medium text-white/65 transition-colors hover:text-white md:block">
                  Sign in
                </button>
              </DialogTrigger>
              <Button
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] hover:bg-primary/90"
                onClick={() => setIsLoginOpen(true)}
              >
                Get started
              </Button>
            </div>

            <DialogContent className="border-white/5 bg-[#0d0b0e]/95 p-0 backdrop-blur-2xl sm:max-w-[440px]">
              <div className="p-8">
                <DialogHeader className="mb-8">
                  <DialogTitle className="font-heading text-4xl text-white">Welcome back</DialogTitle>
                  <DialogDescription className="pt-2 text-base text-white/45">
                    Sign in to your shared space or create a new account.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 border-white/10 bg-white/[0.02] transition-all focus:border-primary/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 border-white/10 bg-white/[0.02] transition-all focus:border-primary/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 pt-2">
                    <Button
                      className="h-12 rounded-xl bg-primary text-sm font-semibold transition-all hover:bg-primary/80"
                      onClick={async () => {
                        try {
                          await signInWithEmail(email, password);
                        } catch (error) {
                          handleAuthError(error);
                        }
                      }}
                    >
                      Sign in
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12 rounded-xl text-sm text-white/50 hover:text-white"
                      onClick={async () => {
                        try {
                          await signUpWithEmail(email, password);
                          toast({
                            title: 'Check your email',
                            description: 'Use the link in your inbox to finish setting up your account.',
                          });
                        } catch (error) {
                          handleAuthError(error);
                        }
                      }}
                    >
                      Create account
                    </Button>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#0d0b0e] px-4 text-[9px] uppercase tracking-[0.3em] text-white/20">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="h-14 w-full rounded-2xl border-white/10 bg-white/[0.02] text-sm transition-all hover:bg-white/[0.05]"
                    onClick={handleGoogleSignIn}
                    disabled={!supabaseReady}
                  >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} className="mr-3 opacity-70" />
                    Continue with Google
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </nav>

        <main className="relative z-10 mx-auto grid min-h-[calc(100svh-96px)] max-w-7xl items-center gap-14 px-6 pb-20 pt-10 md:grid-cols-[0.94fr,1.06fr] md:px-12 md:pb-24 md:pt-16">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/55"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              Made for long-distance couples
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1 }}
              className="font-serif text-[3.4rem] leading-[0.94] tracking-[-0.04em] text-white sm:text-[4.5rem] md:text-[5.8rem]"
            >
              Stay close,
              <span className="block text-gradient-purple">even when life is far away.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.22 }}
              className="mt-6 space-y-3 text-lg leading-8 text-white/62"
            >
              {heroCopy.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.34 }}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="h-14 rounded-full bg-primary px-8 text-base font-semibold text-white transition-all hover:translate-y-[-1px] hover:bg-primary/90"
                onClick={() => setIsLoginOpen(true)}
              >
                Start together
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-white/12 bg-white/5 px-8 text-base text-white hover:bg-white/10"
                onClick={() => setIsLoginOpen(true)}
              >
                Sign in
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.48 }}
              className="mt-10 grid gap-3 text-sm text-white/58 sm:grid-cols-2"
            >
              <div className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Shared countdowns and plans</div>
              <div className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Photo and memory gallery</div>
              <div className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Simple invite flow</div>
              <div className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Google and email sign-in</div>
            </motion.div>
          </div>

          <div className="relative lg:pl-6">
            <HeroPreview />
          </div>
        </main>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="dex-kicker mb-3">Why people use it</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">The basics couples actually need, in one clean space.</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/50">
            No clutter, no overthinking. Just the parts that help you keep planning, sharing, and checking in together.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {benefits.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="border-t border-white/10 pt-6"
            >
              <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-2xl text-white">{item.title}</h3>
              <p className="mt-4 text-base leading-7 text-white/55">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-white/6 bg-[linear-gradient(180deg,rgba(169,64,100,0.08),rgba(169,64,100,0.02))]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-[0.9fr,1.1fr] md:px-12">
          <div>
            <p className="dex-kicker mb-3">How it works</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">Start in a few minutes and keep everything in sync.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/55">
              Couplesna gives both people one shared place to manage the simple things that matter most.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex gap-5 border-b border-white/8 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-heading text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-xl text-white">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="grid gap-12 md:grid-cols-[1.05fr,0.95fr] md:items-center">
          <div>
            <p className="dex-kicker mb-3">Simple by design</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">A calmer way to stay connected.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
              The layout is built to be easy to understand at a glance: what is next, what changed, and what you both want to remember.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Shared notes</p>
              <p className="mt-4 text-2xl text-white">Quick updates without endless chats.</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/25 p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Photo gallery</p>
              <p className="mt-4 text-2xl text-white">A simple place for the moments you want to keep.</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/25 p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Meetup countdown</p>
              <p className="mt-4 text-2xl text-white">See the next trip at a glance.</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">AI date ideas</p>
              <p className="mt-4 text-2xl text-white">Fresh ideas when you want something new to do together.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(169,64,100,0.18),rgba(8,7,10,0.9))] p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr,auto] md:items-center">
            <div>
              <p className="dex-kicker mb-3">Ready to try it?</p>
              <h2 className="font-serif text-4xl text-white md:text-5xl">Make your shared space in a few clicks.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
                Start with Google or email, invite your partner, and set up your next plan together.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row md:flex-col">
              <Button
                className="h-14 rounded-full bg-white px-8 text-base font-semibold text-[#111111] hover:bg-white/90"
                onClick={() => setIsLoginOpen(true)}
              >
                Open Couplesna
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-full border-white/15 bg-transparent px-8 text-base text-white hover:bg-white/8"
                onClick={handleGoogleSignIn}
                disabled={!supabaseReady}
              >
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-16 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 md:flex-row md:items-start md:justify-between md:px-12">
          <div className="space-y-6">
            <div>
              <p className="font-heading text-3xl tracking-tight text-white">Couplesna</p>
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/30">Simple tools for staying close</p>
            </div>
            <p className="max-w-sm text-base leading-7 text-white/42">
              A simpler way for couples to share plans, memories, and everyday updates.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="dex-kicker mb-4">Build</p>
            <div className="space-y-1 text-sm text-white/22">
              <p>{version}</p>
              <p>&copy; 2026 Couplesna</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
