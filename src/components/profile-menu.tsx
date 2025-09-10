'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AtSign, Calendar, Copy, Heart, LogOut, Paintbrush, Star, UserCircle, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { User, Partner } from '@/lib/types';
import Image from 'next/image';

interface ProfileMenuProps {
  user: User;
  partner: Partner;
  coupleId: string;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-muted-foreground mt-1" />
    <div>
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  </div>
);

export default function ProfileMenu({ user, partner, coupleId }: ProfileMenuProps) {
  const [isSynced, setIsSynced] = React.useState(true); // Mocked state
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: text,
    });
  };

  const renderUnsyncedMenu = () => (
    <>
      <DropdownMenuItem>
        <UserCircle className="mr-2 h-4 w-4" />
        <span>Login</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setIsSynced(true)}>
        <Users className="mr-2 h-4 w-4" />
        <span>Sync with Partner</span>
      </DropdownMenuItem>
    </>
  );

  const renderSyncedMenu = () => (
    <>
      <DropdownMenuLabel>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarImage src={user.profilePic} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarImage src={partner.profilePic} alt={partner.name} />
              <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <span>{user.name} & {partner.name}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile Details</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DropdownMenuItem onSelect={() => handleCopy(coupleId)}>
        <Copy className="mr-2 h-4 w-4" />
        <span>Copy CoupleID</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive" onSelect={() => setIsSynced(false)}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </>
  );

  const renderProfileDetails = (person: User | Partner) => (
    <div className="space-y-6 p-4">
      <DetailItem icon={Calendar} label="Birthday" value={new Date(person.details.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
      <DetailItem icon={Heart} label="Anniversary" value={new Date(person.details.anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
      <DetailItem icon={Paintbrush} label="Favorite Color" value={person.details.favoriteColor} />
      <DetailItem icon={Star} label="Favorite Song" value={person.details.favoriteSong} />
      <DetailItem icon={AtSign} label="Username" value={person.username} />
    </div>
  );

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={isSynced ? user.profilePic : undefined} alt={isSynced ? user.name : 'User'} />
              <AvatarFallback>
                <UserCircle />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          {isSynced ? renderSyncedMenu() : renderUnsyncedMenu()}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={user.name.toLowerCase()} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={user.name.toLowerCase()}>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {user.name}
              </div>
            </TabsTrigger>
            <TabsTrigger value={partner.name.toLowerCase()}>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={partner.profilePic} />
                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {partner.name}
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={user.name.toLowerCase()}>
            {renderProfileDetails(user)}
          </TabsContent>
          <TabsContent value={partner.name.toLowerCase()}>
            {renderProfileDetails(partner)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
