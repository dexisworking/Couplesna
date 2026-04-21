'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock3, MapPinned, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen overflow-x-hidden bg-[#07070a] text-foreground selection:bg-primary/20">
      {/* Premium Background Ethereal Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-[5%] top-[20%] h-[500px] w-[500px] rounded-full bg-orchid/5 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-lavender/5 blur-[80px]" />
      </div>

      {/* Boutique Texture Overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

      <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-10 md:px-12">
        <div className="group flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:border-primary/40">
            <Image src="/couplesna_favicon.png" alt="Couplesna" width={24} height={24} />
          </div>
          <div>
            <p className="font-heading text-2xl tracking-tight text-white">Couplesna</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">Shared Identity</p>
          </div>
        </div>

        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <div className="flex items-center gap-6">
            <DialogTrigger asChild>
              <button className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white">
                Access
              </button>
            </DialogTrigger>
            <Button
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-white/10 hover:shadow-primary/20"
              onClick={() => setIsLoginOpen(true)}
            >
              Initialize
            </Button>
          </div>

          <DialogContent className="border-white/5 bg-[#0c0c11]/95 p-0 backdrop-blur-2xl sm:max-w-[440px]">
            <div className="p-8">
              <DialogHeader className="mb-8">
                <DialogTitle className="font-heading text-4xl">The Sanctuary</DialogTitle>
                <DialogDescription className="pt-2 font-serif text-lg italic text-white/40">
                  Step into your private shared timeline.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Coordinate (Email)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@sanctuary.com"
                    className="h-12 border-white/10 bg-white/[0.02] transition-all focus:border-primary/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Cypher (Password)
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
                    className="h-12 rounded-xl bg-primary text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-primary/80"
                    onClick={async () => {
                      try {
                        await signInWithEmail(email, password);
                      } catch (error) {
                        handleAuthError(error);
                      }
                    }}
                  >
                    Authenticate
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 rounded-xl text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white"
                    onClick={async () => {
                      try {
                        await signUpWithEmail(email, password);
                        toast({
                          title: 'Invitation Pending',
                          description: 'Check your inbox to verify your sanctuary access.',
                        });
                      } catch (error) {
                        handleAuthError(error);
                      }
                    }}
                  >
                    Request Entry
                  </Button>
                </div>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#0c0c11] px-4 text-[9px] uppercase tracking-[0.3em] text-white/20">
                      Alternate Channels
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.15em] transition-all hover:bg-white/[0.05]"
                  onClick={handleGoogleSignIn}
                  disabled={!supabaseReady}
                >
                  <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} className="mr-3 opacity-70" />
                  Google Gateway
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-12 md:pt-28">
        <div className="grid gap-16 md:grid-cols-[1.2fr,0.8fr]">
          <div className="flex flex-col justify-center space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-2 pl-2 pr-5 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-3 w-3" />
              </span>
              Handcrafted for distant hearts
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-6xl leading-[1.05] tracking-tight text-white md:text-8xl"
            >
              A digital <span className="italic text-primary/80">sanctuary</span> for two.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="max-w-xl font-serif text-xl leading-relaxed text-white/50 md:text-2xl"
            >
              Couplesna is an artisanal shared space where distance dissolves into a single, elegant timeline of countdowns, presence, and memories.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              <Button
                size="lg"
                className="h-14 rounded-2xl bg-primary px-10 text-xs font-bold uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-primary/40"
                onClick={() => setIsLoginOpen(true)}
              >
                Create Sanctuary
              </Button>
              <button
                className="group flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-white"
                onClick={() => setIsLoginOpen(true)}
              >
                Sign In 
                <span className="h-[1px] w-8 bg-white/20 transition-all group-hover:w-12 group-hover:bg-primary" />
              </button>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10 flex flex-col gap-6"
            >
              <div className="translate-x-4 md:translate-x-8">
                <SyncCardPreview />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="-translate-y-4">
                   <CountdownPreview />
                </div>
                <div className="translate-y-4">
                   <LocationPreview />
                </div>
              </div>
            </motion.div>
            
            {/* Artistic Asymmetric Element */}
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full border border-white/5 bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
          </div>
        </div>
      </main>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12">
         <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-4">
              <p className="dex-kicker">03 / The Experience</p>
              <h2 className="font-serif text-4xl text-white md:text-5xl">Designed for connection.</h2>
            </div>
            <p className="max-w-xs font-serif text-lg italic text-white/30">
              &quot;We believe that private spaces should feel as warm as a handwritten letter, even in a digital world.&quot;
            </p>
         </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="dex-panel group border-white/5 p-8 transition-all hover:border-primary/20 hover:bg-white/[0.04]">
            <p className="mb-6 dex-kicker text-primary/60">03 / Bond Flow</p>
            <p className="font-serif text-2xl text-white/90">Invite, accept, and <span className="italic">bond</span> instantly with a shared identity.</p>
          </div>
          <div className="dex-panel group border-white/5 p-8 transition-all hover:border-primary/20 hover:bg-white/[0.04]">
            <p className="mb-6 dex-kicker text-primary/60">04 / AI Muses</p>
            <p className="font-serif text-2xl text-white/90">Gemini-powered date suggestions tuned to your <span className="italic">mutual rhythm</span>.</p>
          </div>
          <div className="dex-panel group border-white/5 p-8 transition-all hover:border-primary/20 hover:bg-white/[0.04]">
            <p className="mb-6 dex-kicker text-primary/60">05 / Sacred Space</p>
            <p className="font-serif text-2xl text-white/90">Your data is yours. <span className="italic">Private</span> sessions and storage by design.</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 md:flex-row md:items-start md:justify-between md:px-12">
          <div className="space-y-6">
            <div>
              <p className="font-heading text-3xl tracking-tight text-white">Couplesna</p>
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/30">The Shared Identity</p>
            </div>
            <p className="max-w-xs font-serif text-lg text-white/40">
              Crafting closeness across timezones and digital barriers.
            </p>
          </div>
          
          <div className="flex flex-col items-start gap-10 md:flex-row md:gap-20">
             <div className="space-y-4">
                <p className="dex-kicker">Navigation</p>
                <ul className="space-y-2 text-sm font-medium text-white/30">
                   <li className="transition-colors hover:text-white cursor-pointer">Sanctuary</li>
                   <li className="transition-colors hover:text-white cursor-pointer">Manifesto</li>
                   <li className="transition-colors hover:text-white cursor-pointer">Access</li>
                </ul>
             </div>
             <div className="text-right">
                <p className="dex-kicker mb-4">Integrity</p>
                <div className="space-y-1 font-serif text-sm italic text-white/20">
                  <p>Build {version}</p>
                  <p>&copy; 2026 Couplesna Laboratory</p>
                </div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

