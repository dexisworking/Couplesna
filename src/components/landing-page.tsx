'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation,
  Timer,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

// --- Boutique Element Previews ---

const SyncPreview = () => (
  <div className="relative w-full aspect-square flex items-center justify-center p-8">
    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-orchid/10 rounded-[3rem] blur-3xl" />
    <div className="relative w-full max-w-[280px] h-24 premium-blur rounded-full flex items-center justify-between px-6 border-white/10 shadow-2xl">
      <div className="w-12 h-12 rounded-full bg-lavender/20 border border-lavender/30 flex items-center justify-center overflow-hidden">
         <div className="w-8 h-8 rounded-full bg-orchid/40 blur-sm animate-pulse" />
      </div>
      
      {/* Dynamic Connector */}
      <div className="flex-1 px-4 relative flex items-center h-full">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <motion.path 
            d="M 0 50 Q 50 10 100 50 T 200 50" 
            fill="transparent" 
            stroke="url(#purple-grad)" 
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="purple-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--w-orchid)" />
              <stop offset="100%" stopColor="var(--w-deep-purple)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="w-12 h-12 rounded-full bg-deep-purple/20 border border-deep-purple/30 flex items-center justify-center overflow-hidden">
         <div className="w-6 h-6 rounded-full bg-lavender/60 blur-md animate-ping" />
      </div>
    </div>
  </div>
);

const MapSlicePreview = () => (
  <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-inner group">
    <div className="absolute inset-0 bg-[#121218]">
      <div className="absolute top-1/2 left-1/3 w-32 h-1 bg-white/5 rotate-45" />
      <div className="absolute top-1/4 left-1/2 w-48 h-1 bg-white/5 -rotate-12" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-1 bg-white/5 15" />
    </div>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <MapPin className="relative top-0 w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(148,0,211,0.8)]" />
      </div>
    </motion.div>
    <div className="absolute bottom-4 left-4 right-4 p-4 premium-blur rounded-2xl border-white/5 text-[10px] tracking-widest uppercase opacity-60">
      Last synced: Just Now • Paris, FR
    </div>
  </div>
);

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  preview: React.ComponentType;
  reverse?: boolean;
}

const FeatureSection = ({ title, subtitle, description, preview: Preview, reverse = false }: FeatureSectionProps) => (
  <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 py-24 px-6`}>
    <div className="flex-1 space-y-6">
      <div className="space-y-1">
        <span className="text-secondary-foreground/40 font-heading text-sm tracking-[0.3em] uppercase">{subtitle}</span>
        <h2 className="text-4xl md:text-5xl font-heading text-gradient-purple leading-tight">{title}</h2>
      </div>
      <p className="text-lg text-secondary-foreground/60 leading-relaxed font-serif max-w-lg">
        {description}
      </p>
    </div>
    <div className="flex-1 w-full max-w-xl">
      <motion.div 
        whileHover={{ scale: 1.02, rotate: reverse ? -1 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-full"
      >
        <Preview />
      </motion.div>
    </div>
  </div>
);

export default function LandingPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, supabaseReady } = useAppContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Boutique Overlay Texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orchid/10 rounded-full blur-[140px]" />
      </div>

      <nav className="relative z-[150] flex items-center justify-between px-8 py-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orchid flex items-center justify-center p-[1px]">
               <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center overflow-hidden">
                 <Image src="/couplesna_favicon.png" alt="C" width={24} height={24} className="opacity-80 grayscale group-hover:grayscale-0 transition-all" />
               </div>
            </div>
            <span className="text-2xl font-heading tracking-tight">Couplesna</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                    <button className="text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity font-heading">Sign In</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] bg-[#0c0c0e]/95 border-white/5 backdrop-blur-3xl text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-heading text-gradient-purple">The Portal</DialogTitle>
                        <DialogDescription className="text-white/40 font-serif text-base pt-2">
                             Enter your shared sanctuary. Two hearts, one private space.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs uppercase tracking-widest opacity-50">Email Address</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="bg-white/[0.03] border-white/10 h-12 focus-visible:ring-primary/40 rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="Password" className="text-xs uppercase tracking-widest opacity-50">Secret Key</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="bg-white/[0.03] border-white/10 h-12 focus-visible:ring-primary/40 rounded-xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button className="h-12 text-lg font-heading rounded-xl bg-primary hover:bg-primary/80 transition-all shadow-xl shadow-primary/20" onClick={() => signInWithEmail(email, password)}>Access Space</Button>
                            <Button variant="ghost" className="h-12 font-serif text-white/50 hover:text-white" onClick={() => signUpWithEmail(email, password)}>Create New Bond</Button>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.4em]"><span className="bg-[#0c0c0e] px-4 text-white/20">Third Party</span></div>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full border-white/5 bg-white/[0.02] hover:bg-white/[0.05] h-14 rounded-xl text-base font-heading" 
                          onClick={handleGoogleSignIn}
                          disabled={!supabaseReady}
                        >
                           <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} className="mr-3 grayscale brightness-200" />
                           Authenticate with Google
                        </Button>
                    </div>
                </DialogContent>
          </Dialog>
           <Button className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary-foreground text-xs uppercase tracking-[0.2em] font-heading px-8 py-6 rounded-full transition-all" onClick={() => setIsLoginOpen(true)}>
                Begin
            </Button>
        </div>
      </nav>

      {/* Boutique Hero Section */}
      <section className="relative pt-32 pb-24 px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-start gap-12">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-4 text-primary font-heading tracking-[0.4em] uppercase text-xs"
            >
              <div className="w-12 h-[1px] bg-primary" />
              <span>Sanctuary for Two</span>
            </motion.div>

            <div className="space-y-12 max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl lg:text-9xl font-heading leading-[0.8] tracking-tight"
              >
                DISTANCE IS<br/>
                <span className="text-gradient-purple">ABSOLUTE ZERO.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-xl md:text-2xl text-secondary-foreground/50 max-w-2xl font-serif leading-relaxed"
              >
                An Artisanal shared dashboard for the soulmate&apos;s journey. Experience synchronicity through an intimate digital architecture designed to bridge the void.
              </motion.p>
            </div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.8 }}
               className="pt-8"
            >
              <Button size="lg" className="rounded-full bg-primary h-20 px-12 text-xl font-heading uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all" onClick={() => setIsLoginOpen(true)}>
                Forge Connection
              </Button>
            </motion.div>
        </div>

        {/* Floating Asymmetric Element Preview */}
        <div className="hidden lg:block absolute top-[20%] right-[-5%] w-[450px]">
           <motion.div
             animate={{ y: [0, -20, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           >
             <SyncPreview />
           </motion.div>
        </div>
      </section>

      {/* Features Overview - The Elements */}
      <section className="relative py-32 bg-white/[0.01] border-y border-white/5">
         <div className="max-w-7xl mx-auto">
            <FeatureSection 
               subtitle="Synchronization"
               title="The Pulsing Sync Bridge"
               description="Real-time heartbeat indicators show when your partner is active within your shared space. A living connection that breathes as you do."
               preview={SyncPreview}
            />

            <FeatureSection 
               subtitle="Atmosphere"
               title="Localized Essence"
               description="Beyond mere coordinates. Experience the weather, the time, and the very atmosphere of where your other half stands."
               preview={MapSlicePreview}
               reverse
            />

            <FeatureSection 
               subtitle="Anticipation"
               title="The Clock of Rebirth"
               description="A high-fidelity countdown mechanism that tracks the precious seconds leading to your next physical union. Time, elegantly quantified."
               preview={() => (
                 <div className="premium-blur rounded-[3rem] p-12 border-white/5 aspect-square flex flex-col items-center justify-center gap-4 group">
                    <Timer className="w-12 h-12 text-primary group-hover:rotate-180 transition-transform duration-1000" />
                    <span className="text-6xl md:text-7xl font-heading tracking-tighter">08:14</span>
                    <span className="text-xs uppercase tracking-[0.5em] text-orchid opacity-60">Meeting Again</span>
                 </div>
               )}
            />
         </div>
      </section>

      {/* Security Statement */}
      <section className="py-40 px-8 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
           <Shield className="w-16 h-16 text-primary/40" />
           <h2 className="text-4xl md:text-6xl font-heading leading-tight">ENCRYPTED ATTACHMENT.</h2>
           <p className="font-serif text-lg text-secondary-foreground/50 leading-relaxed italic">
             {&quot;Your shared moments are a sanctuary, not a statistic.&quot;}
           </p>
           <p className="font-serif text-base text-secondary-foreground/40 max-w-xl">
             We employ an isolated vault architecture. Your CoupleID is a unique primary key to which only your combined identities hold the decryption rights.
           </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40 px-8 bg-gradient-to-b from-transparent to-primary/10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-12">
           <h2 className="text-5xl md:text-8xl font-heading tracking-tighter">THE BOND AWAITS.</h2>
           <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" className="rounded-full bg-primary h-20 px-16 text-xl font-heading uppercase tracking-widest" onClick={() => setIsLoginOpen(true)}>
                Sign Up
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-primary/20 h-20 px-16 text-xl font-heading uppercase tracking-widest hover:bg-white/5">
                Learn
              </Button>
           </div>
        </div>
      </section>

      {/* Boutique Footer */}
      <footer className="py-24 px-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col gap-4 items-start">
             <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                <span className="font-heading text-lg">Couplesna</span>
             </div>
             <p className="text-xs font-serif max-w-[200px] leading-relaxed">
               Connecting souls across any coordinate. Forever personal.
             </p>
           </div>
           
           <div className="flex gap-16 text-xs uppercase tracking-widest font-heading">
             <div className="flex flex-col gap-4">
                <span className="opacity-40">Privacy</span>
                <span className="opacity-40">Ethics</span>
                <span className="opacity-40">Security</span>
             </div>
             <div className="flex flex-col gap-4">
                <span className="opacity-40">Twitter</span>
                <span className="opacity-40">Studio</span>
             </div>
           </div>

           <div className="text-[10px] items-end font-serif opacity-30">
              © 2026 DIBYANSHU SEKHAR. ALL RIGHTS RESERVED.
           </div>
        </div>
      </footer>
     </div>
  );
}
