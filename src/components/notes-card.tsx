'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dashboardData } from '@/lib/data';
import { Edit3, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesCardProps {
  notes: {
    user: string;
    partner: string;
  };
}

export default function NotesCard({ notes }: NotesCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [userNote, setUserNote] = React.useState(notes.user);
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the note to your backend
    toast({
      title: 'Note saved!',
      description: 'Your partner will see your updated note.',
    });
  };

  return (
    <Card className="shadow-lg h-full">
      <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
        <div className="flex-grow space-y-4">
          {/* Partner's Note */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={dashboardData.partner.profilePic} alt={dashboardData.partner.name} />
              <AvatarFallback>{dashboardData.partner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <p className="text-sm font-semibold mb-1">{dashboardData.partner.name}</p>
              <div className="bg-muted rounded-lg p-3 text-sm min-h-[80px]">
                {notes.partner}
              </div>
            </div>
          </div>

          {/* User's Note */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={dashboardData.user.profilePic} alt={dashboardData.user.name} />
              <AvatarFallback>{dashboardData.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <p className="text-sm font-semibold mb-1">{dashboardData.user.name} (You)</p>
              <Textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                readOnly={!isEditing}
                className="bg-primary/5 text-sm ring-offset-background focus-visible:ring-primary min-h-[80px]"
                placeholder="Leave a note for your partner..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          {isEditing ? (
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Note
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
