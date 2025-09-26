
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import type { User, Partner } from '@/lib/types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppContext } from '@/context/app-context';


const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="flex-grow">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-muted-foreground text-sm">{value}</p>
    </div>
  </div>
);

export default function ProfileMenu({
  user,
  partner,
  coupleId,
}: {
  user: User,
  partner: Partner,
  coupleId: string
}) {
  const { isSynced, setIsSynced, setCoupleId, coupleId: currentCoupleId } = useAppContext();
  const { toast } = useToast();
  const [partnerIdInput, setPartnerIdInput] = React.useState('');


  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${label}: ${text}`,
    });
  };

  const handleConnect = () => {
    if(partnerIdInput.trim()){
      setCoupleId(partnerIdInput.trim());
      toast({
        title: "Connecting...",
        description: `Now syncing with Couple ID: ${partnerIdInput.trim()}`
      })
    } else {
      toast({
        variant: 'destructive',
        title: "Invalid ID",
        description: "Please enter a valid Couple ID."
      })
    }
  }

  const handleLogout = () => {
    setIsSynced(false);
    setCoupleId(null);
     toast({
        title: "You've been logged out.",
        description: `You are no longer synced.`
      })
  }

  const renderProfileDetails = (person: User | Partner) => (
    <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
      <DetailItem
        icon={Calendar}
        label="Birthday"
        value={new Date(person.details.birthday).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10">
          <Avatar className="h-8 w-8">
            {isSynced ? (
              <AvatarImage src={user.profilePic} alt={user.name} />
            ) : (
              <AvatarImage src={undefined} alt={'User'} />
            )}
            <AvatarFallback>
              {isSynced ? user.name.charAt(0) : <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
          <DialogDescription>
            Manage your connection, view details, and handle your account.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Tabs defaultValue="sync" className="w-full">
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
                    <Label htmlFor="coupleId">Your Couple ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="coupleId"
                        readOnly
                        value={currentCoupleId || 'Not Synced'}
                        className="font-mono text-sm bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(currentCoupleId || '', 'Couple ID')}
                        disabled={!isSynced || !currentCoupleId}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerId">Partner's Couple ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="partnerId"
                        placeholder="Paste your partner's ID here"
                        value={partnerIdInput}
                        onChange={(e) => setPartnerIdInput(e.target.value)}
                      />
                      <Button onClick={handleConnect}>Connect</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted space-y-4">
                  <h3 className="font-semibold">Invite by Email</h3>
                   <div className="space-y-2">
                    <Label htmlFor="partnerEmail">Partner's Email</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="partnerEmail"
                        type="email"
                        placeholder="partner@example.com"
                      />
                      <Button>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="mt-6">
              {isSynced ? (
                 <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg bg-muted">
                        <div className="flex items-center justify-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                                <AvatarImage src={user.profilePic} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Heart className="h-8 w-8 text-primary animate-pulse" />
                            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                                <AvatarImage src={partner.profilePic} alt={partner.name} />
                                <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">{user.name} & {partner.name}</h3>
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Anniversary: {new Date(user.details.anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <Tabs defaultValue="user-details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="user-details">{user.name} (You)</TabsTrigger>
                            <TabsTrigger value="partner-details">{partner.name}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="user-details" className="mt-4">
                            {renderProfileDetails(user)}
                        </TabsContent>
                        <TabsContent value="partner-details" className="mt-4">
                            {renderProfileDetails(partner)}
                        </TabsContent>
                    </Tabs>
                 </div>
              ) : (
                <div className="text-center py-10">
                  <p>Sync with your partner to see details.</p>
                </div>
              )}
            </TabsContent>

            {/* ACCOUNT TAB */}
            <TabsContent value="account" className="mt-6">
              <div className="p-4 rounded-lg bg-muted">
                {isSynced ? (
                   <div className="flex flex-col items-center gap-4">
                     <p>You are logged in as {user.username}.</p>
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
                    <TabsContent value="login" className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="you@example.com" />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" />
                        </div>
                        <Button className="w-full">Login</Button>
                    </TabsContent>
                    <TabsContent value="register" className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="reg-email">Email</Label>
                          <Input id="reg-email" type="email" placeholder="you@example.com" />
                        </div>
                        <div>
                          <Label htmlFor="reg-password">Password</Label>
                          <Input id="reg-password" type="password" />
                        </div>
                        <Button className="w-full" variant="secondary">Create Account</Button>
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
