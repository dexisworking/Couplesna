'use client';

import * as React from 'react';
import {
  AtSign,
  Calendar,
  Check,
  Copy,
  Edit3,
  Heart,
  Loader2,
  LogOut,
  MailPlus,
  Paintbrush,
  Save,
  Star,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { Partner, User } from '@/lib/types';
import { updateProfile } from '@/actions/profile';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,32C44,27.355,44,24.019,44,20L43.611,20.083z"></path>
  </svg>
);

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
    <Icon className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
    <div className="flex-grow">
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm text-muted-foreground">{value || 'Not set'}</p>
    </div>
  </div>
);

export default function ProfileMenu({
  user: currentUser,
  partner,
}: {
  user: User;
  partner: Partner;
}) {
  const {
    user,
    invites,
    isSynced,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    requestConnection,
    acceptInvite,
    declineInvite,
    supabaseReady,
  } = useAppContext();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [partnerIdInput, setPartnerIdInput] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('sync');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  // Edit Profile State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(currentUser.name);
  const [editUsername, setEditUsername] = React.useState(currentUser.username);
  const [editBirthday, setEditBirthday] = React.useState(currentUser.details?.birthday || '');
  const [editAnniversary, setEditAnniversary] = React.useState(currentUser.details?.anniversary || '');
  const [editFavoriteColor, setEditFavoriteColor] = React.useState(currentUser.details?.favoriteColor || '');
  const [editFavoriteSong, setEditFavoriteSong] = React.useState(currentUser.details?.favoriteSong || '');

  const incomingInvites = invites.filter((invite) => invite.direction === 'incoming');
  const outgoingInvites = invites.filter((invite) => invite.direction === 'outgoing');

  const handleCopy = (text: string, label: string) => {
    if (!text) {
      return;
    }

    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${label}: ${text}`,
    });
  };

  const handleConnect = async () => {
    if (!partnerIdInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing partner ID',
        description: 'Enter your partner username or user ID first.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestConnection(partnerIdInput);
      setPartnerIdInput('');
      toast({
        title: result.autoAccepted ? 'Connected successfully' : 'Invite sent',
        description: result.autoAccepted
          ? 'You already had a matching invite, so the connection is now active.'
          : 'Your partner can accept the invite from their Couplesna profile menu.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unable to send the invite.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteDecision = async (inviteId: string, decision: 'accept' | 'decline') => {
    setIsSubmitting(true);
    try {
      if (decision === 'accept') {
        await acceptInvite(inviteId);
        toast({
          title: 'Invite accepted',
          description: 'Your shared dashboard is now active.',
        });
      } else {
        await declineInvite(inviteId);
        toast({
          title: 'Invite declined',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not update invite',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
      toast({
        title: "You've been logged out.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-in failed',
        description: error instanceof Error ? error.message : 'Unable to start Google sign-in.',
      });
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-in failed',
        description: error instanceof Error ? error.message : 'Invalid credentials.',
      });
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async () => {
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password);
      toast({
        title: 'Verification Email Sent',
        description: 'Check your email and click the link to verify your account before logging in.',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-up failed',
        description: error instanceof Error ? error.message : 'Unable to create account.',
      });
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        fullName: editName,
        username: editUsername,
        details: {
          birthday: editBirthday,
          anniversary: editAnniversary,
          favoriteColor: editFavoriteColor,
          favoriteSong: editFavoriteSong,
        },
      });
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProfileDetails = (person: User | Partner) => (
    <div className="space-y-6 rounded-lg bg-muted/50 p-4">
      <DetailItem
        icon={Calendar}
        label="Birthday"
        value={
          person.details?.birthday
            ? new Date(person.details.birthday).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : undefined
        }
      />
      <DetailItem icon={Paintbrush} label="Favorite Color" value={person.details?.favoriteColor} />
      <DetailItem icon={Star} label="Favorite Song" value={person.details?.favoriteSong} />
      <DetailItem icon={AtSign} label="Username" value={person.username} />
    </div>
  );

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    currentUser.name;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Open profile menu"
          className="relative h-10 w-10 rounded-full border border-white/10 bg-black/30 backdrop-blur-md hover:bg-black/50"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.profilePic} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] overflow-y-auto border-white/10 bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
          <DialogDescription>
            {user
              ? `Signed in as ${displayName}`
              : 'Sign in, connect with your partner, and manage your shared space.'}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="sync"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4 w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sync">
              <Heart className="mr-2 h-4 w-4" /> Sync
            </TabsTrigger>
            <TabsTrigger value="details">
              <Users className="mr-2 h-4 w-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="account">
              <UserIcon className="mr-2 h-4 w-4" /> Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="mt-6 space-y-6">
            {!supabaseReady && (
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Supabase environment variables are not configured yet, so sign-in and partner sync are disabled.
              </div>
            )}

            <div className="space-y-4 rounded-lg bg-muted p-4">
              <h3 className="font-semibold">Connect with your Partner</h3>
              <div className="space-y-2">
                <Label htmlFor="userId">Your User ID</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="userId"
                    readOnly
                    value={user?.id || 'Sign in to get your ID'}
                    className="bg-background/50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(user?.id || '', 'Your User ID')}
                    disabled={!user}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Your Username</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="username"
                    readOnly
                    value={currentUser.username || 'Not set'}
                    className="bg-background/50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(currentUser.username, 'Your username')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerId">Partner Username or User ID</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="partnerId"
                    placeholder="Paste your partner username or ID"
                    value={partnerIdInput}
                    onChange={(event) => setPartnerIdInput(event.target.value)}
                    disabled={!user || isSynced || isSubmitting || !supabaseReady}
                  />
                  <Button onClick={handleConnect} disabled={!user || isSynced || isSubmitting || !supabaseReady}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MailPlus className="mr-2 h-4 w-4" />
                    )}
                    {isSynced ? 'Connected' : 'Send'}
                  </Button>
                </div>
                {isSynced && (
                  <p className="text-xs text-muted-foreground">
                    You are already connected. Sign out to switch accounts.
                  </p>
                )}
              </div>
            </div>

            {incomingInvites.length > 0 && (
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <h3 className="font-semibold">Incoming Invites</h3>
                {incomingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col gap-3 rounded-lg border border-white/10 bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={invite.otherAvatarUrl || undefined} alt={invite.otherName} />
                        <AvatarFallback>{invite.otherName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{invite.otherName}</p>
                        <p className="text-sm text-muted-foreground">@{invite.otherUsername}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleInviteDecision(invite.id, 'accept')} disabled={isSubmitting}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInviteDecision(invite.id, 'decline')}
                        disabled={isSubmitting}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {outgoingInvites.length > 0 && (
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <h3 className="font-semibold">Pending Requests</h3>
                {outgoingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 p-3"
                  >
                    <div>
                      <p className="font-medium">{invite.otherName}</p>
                      <p className="text-sm text-muted-foreground">@{invite.otherUsername}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Waiting</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            {isSynced ? (
              <div className="space-y-6">
                <div className="rounded-lg bg-muted p-6 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                      <AvatarImage src={currentUser.profilePic} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Heart className="h-8 w-8 animate-pulse text-primary" />
                    <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                      <AvatarImage src={partner.profilePic} alt={partner.name} />
                      <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">
                    {currentUser.name} & {partner.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Anniversary:{' '}
                    {currentUser.details?.anniversary
                      ? new Date(currentUser.details.anniversary).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not set'}
                  </p>
                </div>
                <Tabs defaultValue="user-details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user-details">{currentUser.name} (You)</TabsTrigger>
                    <TabsTrigger value="partner-details">{partner.name}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="user-details" className="mt-4">
                    <div className="flex justify-end mb-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => setIsEditing(!isEditing)}
                         disabled={isSubmitting}
                       >
                         {isEditing ? (
                           <>
                             <X className="mr-2 h-4 w-4" /> Cancel
                           </>
                         ) : (
                           <>
                             <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                           </>
                         )}
                       </Button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Display Name</Label>
                          <Input 
                            id="edit-name" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-username">Username</Label>
                          <Input 
                            id="edit-username" 
                            value={editUsername} 
                            onChange={(e) => setEditUsername(e.target.value)} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-birthday">Birthday</Label>
                            <Input 
                              id="edit-birthday" 
                              type="date" 
                              value={editBirthday} 
                              onChange={(e) => setEditBirthday(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-anniversary">Anniversary</Label>
                            <Input 
                              id="edit-anniversary" 
                              type="date" 
                              value={editAnniversary} 
                              onChange={(e) => setEditAnniversary(e.target.value)} 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-color">Favorite Color</Label>
                          <Input 
                            id="edit-color" 
                            placeholder="e.g. Emerald Green" 
                            value={editFavoriteColor} 
                            onChange={(e) => setEditFavoriteColor(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-song">Favorite Song</Label>
                          <Input 
                            id="edit-song" 
                            placeholder="Song name - Artist" 
                            value={editFavoriteSong} 
                            onChange={(e) => setEditFavoriteSong(e.target.value)} 
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={handleUpdateProfile} 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      renderProfileDetails(currentUser)
                    )}
                  </TabsContent>
                  <TabsContent value="partner-details" className="mt-4">
                    {renderProfileDetails(partner)}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/50 p-6 text-center text-muted-foreground">
                Send or accept a connection invite to unlock your shared details and gallery.
              </div>
            )}
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="rounded-lg bg-muted p-4">
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Signed in as <span className="font-medium text-foreground">{user.email}</span>
                  </p>
                  
                  {currentUser.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => window.open('/admin', '_blank')}
                    >
                      <Star className="mr-2 h-4 w-4 text-primary" />
                      Admin Dashboard
                    </Button>
                  )}

                  <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled={isSubmitting || !supabaseReady} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={isSubmitting || !supabaseReady} 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="w-full flex-1" 
                        onClick={handleEmailSignIn} 
                        disabled={isSubmitting || !email || !password || !supabaseReady}
                      >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full flex-1" 
                        onClick={handleEmailSignUp} 
                        disabled={isSubmitting || !email || !password || !supabaseReady}
                      >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-muted px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full py-6 text-lg"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || !supabaseReady}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Sign in with Google
                  </Button>
                  
                  {!supabaseReady && (
                    <p className="text-center text-sm text-muted-foreground">
                      Add the Supabase environment variables from `.env.example` to enable auth.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
