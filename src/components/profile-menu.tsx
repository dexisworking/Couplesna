
'use client';

import * as React from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AtSign,
  Calendar,
  Copy,
  Heart,
  LogOut,
  Paintbrush,
  Star,
  User as UserIcon,
  Users,
  Wand2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { User, Partner, DashboardData } from '@/lib/types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppContext } from '@/context/app-context';
import { auth, db } from '@/lib/firebase';
import { dashboardData as initialData } from '@/lib/data';

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
}) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="flex-grow">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-muted-foreground text-sm">{value || 'Not set'}</p>
    </div>
  </div>
);

export default function ProfileMenu({
  user: userData,
  partner: partnerData,
}: {
  user: User,
  partner: Partner,
  coupleId: string
}) {
  const { user, isSynced, setCoupleId, data } = useAppContext();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('sync');

  // Form states
  const [partnerIdInput, setPartnerIdInput] = React.useState('');
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regName, setRegName] milking = React.useState('');

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${label}: ${text}`,
    });
  };

  const handleConnect = async () => {
    if (!partnerIdInput.trim() || !user) {
      toast({ variant: 'destructive', title: 'Invalid ID', description: 'Please enter a valid User ID to connect.' });
      return;
    }

    const partnerUid = partnerIdInput.trim();
    if(partnerUid === user.uid) {
      toast({ variant: 'destructive', title: 'Cannot connect to self', description: 'You cannot use your own User ID.' });
      return;
    }

    const newCoupleId = [user.uid, partnerUid].sort().join('_');
    const coupleDocRef = doc(db, 'couples', newCoupleId);

    try {
        const coupleDoc = await getDoc(coupleDocRef);
        if(!coupleDoc.exists()) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const partnerDoc = await getDoc(doc(db, 'users', partnerUid));

            if (!partnerDoc.exists()) {
                toast({ variant: 'destructive', title: 'Partner not found', description: 'The entered partner ID does not correspond to a registered user.' });
                return;
            }
            
            const newCoupleData: DashboardData = {
                ...initialData,
                coupleId: newCoupleId,
                users: [user.uid, partnerUid],
                user: { ...initialData.user, username: user.uid, name: user.displayName || "User" },
                partner: { ...initialData.partner, username: partnerUid, name: partnerDoc.data()?.name || "Partner" },
            };
            await setDoc(coupleDocRef, newCoupleData);
        }
        setCoupleId(newCoupleId);
        toast({ title: 'Connection successful!', description: `You are now synced with your partner.` });
        setIsOpen(false);
    } catch(error) {
        console.error("Error connecting couple:", error);
        toast({ variant: 'destructive', title: 'Connection Failed', description: 'Could not connect with partner. Please check the ID and try again.' });
    }
  };
  
  const handleLogout = () => {
    signOut(auth);
    setCoupleId(null);
    toast({
        title: "You've been logged out.",
    });
    setIsOpen(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill out all fields.'});
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      await updateProfile(userCredential.user, { displayName: regName });
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
          name: regName,
          email: regEmail,
      });

      toast({ title: 'Account Created!', description: 'You can now log in.' });
      setRegEmail('');
      setRegPassword('');
      setRegName('');
      setActiveTab('account'); // Switch to login tab
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please provide email and password.'});
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast({ title: 'Logged In Successfully!' });
      setIsOpen(false); // Close dialog on successful login
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    }
  }

  const renderProfileDetails = (person: User | Partner) => (
    <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
      <DetailItem
        icon={Calendar}
        label="Birthday"
        value={person.details.birthday ? new Date(person.details.birthday).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) : undefined}
      />
      <DetailItem
        icon={Paintbrush}
        label="Favorite Color"
        value={person.details.favoriteColor}
      />
      <DetailItem
        icon={Star}
        label="Favorite Song"
        value={person.details.favoriteSong}
      />
      <DetailItem icon={AtSign} label="Username" value={person.username} />
    </div>
  );
  
  const currentUserId = user?.uid;
  
  // Determine which user data to show as "user" and "partner" based on logged-in user
  const loggedInUserIsUser = data?.user?.username === currentUserId;
  const displayUser = loggedInUserIsUser ? data.user : data.partner;
  const displayPartner = loggedInUserIsUser ? data.partner : data.user;


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10">
          <Avatar className="h-8 w-8">
            <AvatarImage src={isSynced ? displayUser.profilePic : undefined} alt={isSynced ? displayUser.name : 'User'} />
            <AvatarFallback>
              {isSynced && displayUser.name ? displayUser.name.charAt(0) : <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
           <DialogDescription>
            {user ? `Welcome, ${user.displayName || user.email}` : 'Manage your connection, view details, and handle your account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Tabs defaultValue="sync" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sync">
                <Heart className="mr-2 h-4 w-4" /> Sync
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!isSynced}>
                <Users className="mr-2 h-4 w-4" /> Details
              </TabsTrigger>
              <TabsTrigger value="account">
                <UserIcon className="mr-2 h-4 w-4" /> Account
              </TabsTrigger>
            </TabsList>

            {/* SYNC TAB */}
            <TabsContent value="sync" className="mt-6">
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted space-y-4">
                  <h3 className="font-semibold">Connect with your Partner</h3>
                  <div className="space-y-2">
                    <Label htmlFor="coupleId">Your User ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="coupleId"
                        readOnly
                        value={currentUserId || 'Please log in'}
                        className="font-mono text-sm bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(currentUserId || '', 'Your User ID')}
                        disabled={!user}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerId">Partner's User ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="partnerId"
                        placeholder="Paste your partner's ID here"
                        value={partnerIdInput}
                        onChange={(e) => setPartnerIdInput(e.target.value)}
                         disabled={!user || isSynced}
                      />
                      <Button onClick={handleConnect} disabled={!user || isSynced}>
                        {isSynced ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                     {isSynced && <p className="text-xs text-muted-foreground">You are already connected. Unsync from the Account tab to connect to someone else.</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="mt-6">
              {isSynced && displayUser && displayPartner ? (
                 <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg bg-muted">
                        <div className="flex items-center justify-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                                <AvatarImage src={displayUser.profilePic} alt={displayUser.name} />
                                <AvatarFallback>{displayUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Heart className="h-8 w-8 text-primary animate-pulse" />
                            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                                <AvatarImage src={displayPartner.profilePic} alt={displayPartner.name} />
                                <AvatarFallback>{displayPartner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">{displayUser.name} & {displayPartner.name}</h3>
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Anniversary: {displayUser.details.anniversary ? new Date(displayUser.details.anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}</p>
                        </div>
                    </div>
                    <Tabs defaultValue="user-details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="user-details">{displayUser.name} (You)</TabsTrigger>
                            <TabsTrigger value="partner-details">{displayPartner.name}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="user-details" className="mt-4">
                            {renderProfileDetails(displayUser)}
                        </TabsContent>
                        <TabsContent value="partner-details" className="mt-4">
                            {renderProfileDetails(displayPartner)}
                        </TabsContent>
                    </Tabs>
                 </div>
              ) : (
                <div className="text-center py-10">
                  <p>Log in and connect with your partner to see details.</p>
                </div>
              )}
            </TabsContent>

            {/* ACCOUNT TAB */}
            <TabsContent value="account" className="mt-6">
              <div className="p-4 rounded-lg bg-muted">
                {user ? (
                   <div className="flex flex-col items-center gap-4">
                     <p>You are logged in as {user.email}.</p>
                     <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4"/>
                        Logout & Unsync
                     </Button>
                   </div>
                ) : (
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="mt-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full">Login</Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="register" className="mt-4">
                       <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <Label htmlFor="reg-name">Your Name</Label>
                          <Input id="reg-name" type="text" placeholder="Alex" value={regName} onChange={e => setRegName(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="reg-email">Email</Label>
                          <Input id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="reg-password">Password</Label>
                          <Input id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" variant="secondary">Create Account</Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
