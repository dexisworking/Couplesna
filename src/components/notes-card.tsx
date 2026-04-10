'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2 } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

interface NotesCardProps {
  notes: {
    user: string;
    partner: string;
  };
}

export default function NotesCard({ notes }: NotesCardProps) {
  const { setData, isSynced } = useAppContext();
  const { toast } = useToast();
  const [draft, setDraft] = React.useState(notes.user);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDraft(notes.user);
  }, [notes.user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setData({
        notes: {
          user: draft,
          partner: notes.partner,
        },
      });
      setIsEditing(false);
      toast({
        title: 'Heartbeat updated',
        description: 'Your note is now saved to your shared space.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Could not save your note.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <h2 className="mb-2 text-center text-xl font-semibold text-white/90">Heartbeat Notes</h2>
      <p className="mb-4 text-center text-xs text-white/60">
        {isSynced ? 'Write your note, then save it for your partner.' : 'Connect with your partner to save notes.'}
      </p>
      <div className="flex flex-grow flex-col justify-end gap-3 p-4">
        <div className="max-w-[85%] rounded-[20px] rounded-bl-[6px] bg-slate-700 px-4 py-3 text-sm text-white">
          {notes.partner || 'Your partner has not written a note yet.'}
        </div>

        {isEditing ? (
          <div className="ml-auto flex w-full max-w-[85%] flex-col gap-3 rounded-[20px] rounded-br-[6px] bg-primary/90 px-4 py-3 text-white">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              className="border-white/20 bg-transparent text-white placeholder:text-white/60"
              placeholder="Write a note for your partner..."
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setDraft(notes.user);
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative ml-auto max-w-[85%]">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="peer w-full rounded-[20px] rounded-br-[6px] bg-primary/90 px-4 py-3 text-left text-sm text-white transition hover:brightness-110"
            >
              {notes.user || 'Tap to write your note.'}
            </button>
            <div className="absolute -top-2 -right-2 rounded-full bg-background p-1.5 opacity-0 transition-opacity peer-hover:opacity-100 hover:opacity-100 shadow-md cursor-pointer" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3 w-3 text-primary" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
