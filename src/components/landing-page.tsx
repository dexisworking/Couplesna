'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { 
  Heart, 
  MapPin, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CalendarCheck2, 
  Smartphone,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

const FeatureCard = ({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="widget p-6 flex flex-col items-center text-center gap-4 transition-all hover:bg-white/10"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-sm text-white/60 leading-relaxed">{description}</p>
  </motion.div>
);

const StepItem = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex gap-6 items-start">
    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
      {number}
    </div>
    <div className="space-y-1">
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="text-sm text-white/50">{description}</p>
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
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
            <Image src="/couplesna_favicon.png" alt="Couplesna" width={40} height={40} className="rounded-lg shadow-lg" />
            <span className="text-2xl font-bold tracking-tighter">Couplesna</span>
        </div>
        <div className="flex items-center gap-4">
             <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="hover:bg-white/5 transition-colors">Sign In</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] bg-[#0c0c0e] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Stay connected with your partner in a shared private space.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="name@example.com" 
                                className="bg-white/5 border-white/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="bg-white/5 border-white/10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={() => signInWithEmail(email, password)}>Log In</Button>
                            <Button variant="secondary" className="flex-1" onClick={() => signUpWithEmail(email, password)}>Register</Button>
                        </div>
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0c0c0e] px-2 text-white/40">Or continue with</span></div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full border-white/10 hover:bg-white/5 py-6 text-base" 
                          onClick={handleGoogleSignIn}
                          disabled={!supabaseReady}
                        >
                           <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} className="mr-2" />
                           Google
                        </Button>
                    </div>
                </DialogContent>
             </Dialog>
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 rounded-full shadow-lg shadow-primary/20" onClick={() => setIsLoginOpen(true)}>
                Get Started
            </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-12 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium"
            >
                <Sparkles className="w-4 h-4" />
                <span>Connecting Hearts Across Distances</span>
            </motion.div>
            
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
            >
                Distance is just a <br /><span className="text-primary italic font-serif">Number.</span>
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
            >
                Couplesna is a premium, shared space for long-distance partners. Sync your routines, track your countdowns, and grow together, wherever you are.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full h-14 text-lg font-bold w-full sm:w-auto" onClick={() => setIsLoginOpen(true)}>
                    Create Shared Space <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 h-14 rounded-full px-8 text-lg w-full sm:w-auto">
                    Learn How it Works
                </Button>
            </motion.div>
        </div>
      </section>

      {/* App Preview Frame */}
      <section className="px-6 py-20 relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative widget p-3 rounded-[32px] border-white/5 shadow-2xl overflow-hidden group"
              >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative rounded-[20px] overflow-hidden border border-white/5 bg-black">
                      <Image 
                        src="https://placehold.co/1920x1080/09090b/e11d48?text=Couplesna+Dashboard+Coming+Soon" 
                        alt="App Dashboard" 
                        width={1920} 
                        height={1080} 
                        className="opacity-80 group-hover:opacity-100 transition-all duration-700"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <Zap className="w-8 h-8 text-primary shadow-lg shadow-primary" />
                             </div>
                             <span className="text-lg font-bold tracking-widest uppercase">Live Dashboard</span>
                          </div>
                      </div>
                  </div>
              </motion.div>
          </div>
      </section>

      {/* How it Works / The Bond */}
      <section className="px-6 py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                  <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-bold tracking-tight">How the Bond works</h2>
                      <p className="text-white/50 text-lg">One shared space. Two individuals. Forever connected.</p>
                  </div>
                  <div className="space-y-8">
                      <StepItem 
                        number="01" 
                        title="Create your account" 
                        description="Sign up solo and set up your personal profile and current location." 
                      />
                      <StepItem 
                        number="02" 
                        title="Invite your partner" 
                        description="Send a private invite using their unique ID or username. Privacy is our priority." 
                      />
                      <StepItem 
                        number="03" 
                        title="The Bond is formed" 
                        description="Once they accept, your IDs bind to a single CoupleID. Your worlds are now in sync." 
                      />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                      <FeatureCard icon={MapPin} title="Live Tracking" description="Always know where your partner is and the weather they're experiencing." />
                      <FeatureCard icon={Heart} title="Shared Notes" description="Leave sweet reminders and shared thoughts on a real-time dashboard." />
                  </div>
                  <div className="space-y-4">
                      <FeatureCard icon={CalendarCheck2} title="Countdowns" description="Track the seconds until you meet again. Every moment counts." />
                      <FeatureCard icon={Lock} title="Private Gallery" description="[Coming Soon] A secure, encrypted vault for your shared memories." />
                  </div>
              </div>
          </div>
      </section>

      {/* Security & Features */}
      <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto text-center space-y-16">
              <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">Built for connection, secured for privacy</h2>
                  <p className="text-white/50 max-w-2xl mx-auto">We use military-grade architecture to ensure that your shared moments stay between the two of you.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-3xl border border-white/10 space-y-4">
                      <ShieldCheck className="w-10 h-10 text-green-500 mx-auto" />
                      <h4 className="text-xl font-bold">End-to-End Privacy</h4>
                      <p className="text-sm text-white/50">Your data belongs to you. We never share or sell personal relationship metrics.</p>
                  </div>
                   <div className="p-8 rounded-3xl border border-white/10 space-y-4">
                      <Zap className="w-10 h-10 text-yellow-500 mx-auto" />
                      <h4 className="text-xl font-bold">Instant Sync</h4>
                      <p className="text-sm text-white/50">Experience real-time updates across all your shared widgets without refreshing.</p>
                  </div>
                   <div className="p-8 rounded-3xl border border-white/10 space-y-4">
                      <Smartphone className="w-10 h-10 text-blue-500 mx-auto" />
                      <h4 className="text-xl font-bold">Mobile First</h4>
                      <p className="text-sm text-white/50">Designed to bridge the gap on the go. Perfectly optimized for iOS and Android.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/5 bg-[#050507]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3 opacity-60">
                  <Image src="/logo.png" alt="Couplesna" width={32} height={32} className="rounded-md" />
                  <span className="font-bold">Couplesna</span>
              </div>
              <p className="text-sm text-white/40">© 2026 Dibyanshu Sekhar. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-white/60">
                  <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                  <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              </div>
          </div>
      </footer>
    </div>
  );
}
