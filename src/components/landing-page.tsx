'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock3, LockKeyhole, MapPinned, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getClientProjectVersion } from '@/actions/version';
import { useToast } from '@/hooks/use-toast';

const SyncCardPreview = () => (
  <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_20px_60px_-40px_rgba(134,100,180,0.55)]">
    <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/50">
      <span>Always In Sync</span>
      <span>LIVE</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-full border border-white/20 bg-white/10" />
        <div>
          <p className="font-heading text-white">You</p>
          <p className="text-xs text-white/55">Kolkata</p>
        </div>
      </div>
      <motion.div
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary to-orchid/30"
      />
      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="font-heading text-white">Partner</p>
          <p className="text-xs text-white/55">Berlin</p>
        </div>
        <span className="h-11 w-11 rounded-full border border-white/20 bg-white/10" />
      </div>
    </div>
  </div>
);

const CountdownPreview = () => (
  <div className="rounded-3xl border border-white/10 bg-[#111116] p-6">
    <div className="mb-3 flex items-center gap-2 text-white/55">
      <Clock3 className="h-4 w-4" />
      <span className="text-xs uppercase tracking-[0.24em]">Next Meet</span>
    </div>
    <p className="font-heading text-5xl tracking-tight text-white">21d 04h</p>
    <p className="mt-3 text-sm text-white/55">A calm, shared countdown that both partners can update.</p>
  </div>
);

const LocationPreview = () => (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f1016] p-6">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(140,108,192,0.24),transparent_60%)]" />
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-white/50">Location Pulse</p>
        <MapPinned className="h-4 w-4 text-primary" />
      </div>
      <div className="h-28 rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="grid h-full grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="rounded-md bg-white/[0.05]" />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-white/55">Partner currently near Paris, FR.</p>
    </div>
  </div>
);

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
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0e] text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(148,106,170,0.18),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(166,119,180,0.16),transparent_45%)]" />

      <div className="pointer-events-none fixed inset-0 opacity-[0.02] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5">
            <Image src="/couplesna_favicon.png" alt="Couplesna" width={20} height={20} />
          </div>
          <div>
            <p className="font-heading text-xl text-white">Couplesna</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Shared Identity</p>
          </div>
        </div>

        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <div className="flex items-center gap-4">
            <DialogTrigger asChild>
              <button className="text-xs uppercase tracking-[0.25em] text-white/65 transition hover:text-white">
                Sign In
              </button>
            </DialogTrigger>
            <Button
              className="h-11 rounded-full border border-white/20 bg-white/10 px-7 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20"
              onClick={() => setIsLoginOpen(true)}
            >
              Start
            </Button>
          </div>

          <DialogContent className="sm:max-w-[430px] border-white/10 bg-[#0c0c11] text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-3xl">Welcome Back</DialogTitle>
              <DialogDescription className="font-serif text-base text-white/55">
                Sign in to your private space and continue your shared timeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-white/55">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 border-white/15 bg-white/[0.03]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-white/55">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 border-white/15 bg-white/[0.03]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Button
                  className="h-11 rounded-xl bg-primary font-heading uppercase tracking-[0.15em] hover:bg-primary/85"
                  onClick={async () => {
                    try {
                      await signInWithEmail(email, password);
                    } catch (error) {
                      handleAuthError(error);
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 rounded-xl text-white/70 hover:text-white"
                  onClick={async () => {
                    try {
                      await signUpWithEmail(email, password);
                      toast({
                        title: 'Check your inbox',
                        description: 'Your signup was received. Verify email if required.',
                      });
                    } catch (error) {
                      handleAuthError(error);
                    }
                  }}
                >
                  Create account
                </Button>
              </div>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0c0c11] px-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/15 bg-white/[0.02] hover:bg-white/[0.05]"
                onClick={handleGoogleSignIn}
                disabled={!supabaseReady}
              >
                <Image src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} className="mr-2" />
                Google
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </nav>

      <section className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 pb-16 pt-12 md:grid-cols-2 md:px-8 md:pt-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/55">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Crafted for long-distance couples
          </div>
          <h1 className="font-heading text-5xl leading-[0.92] text-white md:text-7xl">
            A private home for your relationship.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/60">
            Couplesna gives two people one shared digital space: synchronized countdowns, a soft pulse of partner
            presence, thoughtful AI date ideas, and a clean connection flow that stays personal.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="h-12 rounded-full bg-primary px-7 font-heading uppercase tracking-[0.15em] hover:bg-primary/90"
              onClick={() => setIsLoginOpen(true)}
            >
              Create Your Space
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-white/[0.03] px-7 uppercase tracking-[0.15em] text-white/80 hover:bg-white/[0.08]"
              onClick={() => setIsLoginOpen(true)}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Element Previews</p>
          <SyncCardPreview />
          <div className="grid gap-4 md:grid-cols-2">
            <CountdownPreview />
            <LocationPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 border-y border-white/10 px-6 py-12 md:grid-cols-3 md:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">Connection Flow</p>
          <p className="text-white/75">Invite, accept, and bond instantly with a dedicated couple identity.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">AI Date Ideas</p>
          <p className="text-white/75">Gemini-powered suggestions tuned to both locations and interests.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">Private by Design</p>
          <p className="flex items-center gap-2 text-white/75">
            <LockKeyhole className="h-4 w-4 text-primary" />
            Session and storage controls built around pair-only access.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-white/50 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-heading text-lg text-white">Couplesna</p>
          <p>Shared identity for two, across every timezone.</p>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.16em] text-white/40">
          <p>Version {version}</p>
          <p>&copy; 2026 Couplesna</p>
        </div>
      </footer>
    </div>
  );
}
