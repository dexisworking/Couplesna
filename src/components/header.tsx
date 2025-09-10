import { Heart } from 'lucide-react';
import ProfileMenu from '@/components/profile-menu';
import type { User, Partner } from '@/lib/types';

interface HeaderProps {
  user: User;
  partner: Partner;
  coupleId: string;
}

export default function Header({ user, partner, coupleId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline text-foreground">
            couplesna
          </h1>
        </div>
        <ProfileMenu user={user} partner={partner} coupleId={coupleId} />
      </div>
    </header>
  );
}
