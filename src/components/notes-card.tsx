
'use client';

import * as React from 'react';
import { useAppContext } from '@/context/app-context';

interface NotesCardProps {
  notes: {
    user: string;
    partner: string;
  };
}

export default function NotesCard({ notes: initialNotes }: NotesCardProps) {
  const { setData } = useAppContext();
  const [notes, setNotes] = React.useState(initialNotes);

  React.useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const makeChatEditable = (
    e: React.MouseEvent<HTMLDivElement>, 
    userKey: 'user' | 'partner'
  ) => {
    const bubble = e.currentTarget;
    const originalText = notes[userKey];
    
    if (bubble.querySelector('input')) return;

    bubble.innerHTML = `<input type="text" class="chat-bubble-input" value="${originalText}">`;
    const input = bubble.querySelector('input') as HTMLInputElement;
    input.focus();
    input.select();

    const save = () => {
      const newText = input.value.trim();
      const final_text = newText || originalText;
      bubble.textContent = final_text;

      if (newText && newText !== originalText) {
        const newNotes = {...notes, [userKey]: final_text };
        setNotes(newNotes);
        setData(prev => prev ? ({...prev, notes: newNotes}) : null);
      }
       bubble.addEventListener('click', (ev) => makeChatEditable(ev as any, userKey), { once: true });
    };
    
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') {
        input.value = originalText;
        input.blur();
      }
    });
  };

  return (
    <>
      <h2 className="text-xl font-semibold text-white/90 mb-2 text-center">Heartbeat Chat</h2>
      <p className="text-center text-xs text-white/60 mb-4">Click a message to edit it.</p>
      <div id="chat-container" className="flex-grow space-y-3 flex flex-col justify-end p-4">
        <div 
          className="chat-bubble chat-bubble-user2"
          onClick={(e) => makeChatEditable(e, 'partner')}
        >
          {notes.partner}
        </div>
        <div 
          className="chat-bubble chat-bubble-user1"
          onClick={(e) => makeChatEditable(e, 'user')}
        >
          {notes.user}
        </div>
      </div>
       <style jsx>{`
        .chat-bubble { padding: 10px 15px; border-radius: 20px; max-width: 80%; cursor: pointer; transition: background-color 0.2s; }
        .chat-bubble-user1 { background-color: #f43f5e; color: white; margin-left: auto; border-bottom-right-radius: 5px;}
        .chat-bubble-user2 { background-color: #374151; color: white; margin-right: auto; border-bottom-left-radius: 5px;}
        .chat-bubble:hover { filter: brightness(1.1); }
        .chat-bubble-input { all: unset; width: 100%; background: transparent; color: white; }
      `}</style>
    </>
  );
}
