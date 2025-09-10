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
import { AtSign, Calendar, Copy, Heart, LogOut, Paintbrush, Star, UserCircle, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { User, Partner } from '@/lib/types';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ProfileMenuProps {
  user: User;
  partner: Partner;
  coupleId: string;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="flex-grow">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-muted-foreground text-sm">{value}</p>
    </div>
  </div>
);

const renderProfileDetails = (person: User | Partner) => (
  <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
    <DetailItem icon={Calendar} label="Birthday" value={new Date(person.details.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
    <DetailItem icon={Paintbrush} label="Favorite Color" value={person.details.favoriteColor} />
    <DetailItem icon={Star} label="Favorite Song" value={person.details.favoriteSong} />
    <DetailItem icon={AtSign} label="Username" value={person.username} />
  </div>
);

export default function ProfileMenu({ user, partner, coupleId }: ProfileMenuProps) {
  const [isSynced, setIsSynced] = React.useState(true);
  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${label}: ${text}`,
    });
  };

  const UnsyncedView = () => (
    <div className="p-1">
      <DialogHeader>
        <DialogTitle>Connect with your Partner</DialogTitle>
        <DialogDescription>
          Login to your account and share your Sync ID to get started.
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="account" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="sync" disabled>Sync</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full">Login</Button>
            <Button variant="link" className="w-full">Create an account</Button>
        </TabsContent>
         <TabsContent value="sync">
            {/* This will be enabled after login */}
        </TabsContent>
      </Tabs>
    </div>
  );

  const SyncedView = () => (
    <div className="p-1">
       <DialogHeader className="text-center">
            <div className="flex items-center justify-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                    <AvatarImage src={user.profilePic} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Heart className="h-8 w-8 text-primary" />
                <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                    <AvatarImage src={partner.profilePic} alt={partner.name} />
                    <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
          <DialogTitle className="mt-4">{user.name} & {partner.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm font-semibold text-primary">Our Anniversary</p>
                    <p className="text-sm text-primary/80">{new Date(user.details.anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
          </TabsContent>
          <TabsContent value="sync" className="mt-4 space-y-6">
            <div className="space-y-2">
                <Label>Your Couple ID</Label>
                <div className="flex items-center gap-2">
                    <Input readOnly value={coupleId} className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(coupleId, 'Couple ID')}><Copy className="h-4 w-4"/></Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Invite your partner</Label>
                <div className="flex items-center gap-2">
                    <Input placeholder="partner@example.com" />
                    <Button>Send Invite</Button>
                </div>
            </div>
             <div className="pt-6 border-t">
                 <Button variant="destructive" className="w-full" onClick={() => setIsSynced(false)}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout & Unsync
                 </Button>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {isSynced ? (
               <AvatarImage src={user.profilePic} alt={user.name} />
            ) : (
               <AvatarImage src={undefined} alt={'User'} />
            )}
            <AvatarFallback>
              {isSynced ? user.name.charAt(0) : <UserCircle />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSynced ? <SyncedView /> : <UnsyncedView />}
      </DialogContent>
    </Dialog>
  );
}
