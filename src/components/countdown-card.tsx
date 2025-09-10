'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';

interface CountdownCardProps {
  nextMeetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TimeBox = ({ value, unit }: { value: number; unit: string }) => (
  <div>
    <span className="text-4xl md:text-5xl font-bold tracking-tight text-white">{String(value).padStart(2, '0')}</span>
    <span className="block text-xs opacity-70 text-white/70">{unit}</span>
  </div>
);

export default function CountdownCard({ nextMeetDate }: CountdownCardProps) {
  const [targetDate, setTargetDate] = React.useState(new Date(nextMeetDate));
  const [newDate, setNewDate] = React.useState<Date | undefined>(targetDate);
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(null);

  const calculateTimeLeft = React.useCallback((): TimeLeft | null => {
    const difference = targetDate.getTime() - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  }, [targetDate]);

  React.useEffect(() => {
    // Set initial time on mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const handleSetDate = () => {
    if (newDate) {
      setTargetDate(newDate);
    }
  };

  return (
    <div className="text-center text-white">
      <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-1">Countdown to our next moment!</h2>
      <p className="text-xs md:text-sm text-white/60 mb-4">Until we meet again...</p>
      
      {timeLeft ? (
        <div className="flex space-x-3 md:space-x-4">
          <TimeBox value={timeLeft.days} unit="Days" />
          <TimeBox value={timeLeft.hours} unit="Hours" />
          <TimeBox value={timeLeft.minutes} unit="Mins" />
          <TimeBox value={timeLeft.seconds} unit="Secs" />
        </div>
      ) : (
         <div className="text-center py-4">
            <p className="text-2xl font-bold text-primary">The wait is over!</p>
          </div>
      )}
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="mt-4 text-xs text-primary hover:text-primary/90">Set Date</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set your next meeting date</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" onClick={handleSetDate}>
                Save Date
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
