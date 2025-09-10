'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
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
import DateIdeaGenerator from './date-idea-generator';

interface CountdownCardProps {
  nextMeetDate: string;
  userLocation: string;
  partnerLocation: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TimeBox = ({ value, unit }: { value: number; unit: string }) => (
  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4 w-24 h-24 md:p-6 md:w-32 md:h-32 transition-all duration-300">
    <span className="text-4xl md:text-6xl font-bold text-primary tracking-tighter">{String(value).padStart(2, '0')}</span>
    <span className="text-sm md:text-base text-primary/80 uppercase tracking-widest">{unit}</span>
  </div>
);

export default function CountdownCard({ nextMeetDate, userLocation, partnerLocation }: CountdownCardProps) {
  const [targetDate, setTargetDate] = React.useState(new Date(nextMeetDate));
  const [newDate, setNewDate] = React.useState<Date | undefined>(targetDate);

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

  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(calculateTimeLeft());

  React.useEffect(() => {
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
    <Card className="shadow-lg">
      <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center space-y-8">
        {timeLeft ? (
          <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-8">
            <TimeBox value={timeLeft.days} unit="Days" />
            <TimeBox value={timeLeft.hours} unit="Hours" />
            <TimeBox value={timeLeft.minutes} unit="Minutes" />
            <TimeBox value={timeLeft.seconds} unit="Seconds" />
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-2xl font-bold text-primary">The wait is over!</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Set New Date
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set your next meeting date</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
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
          <DateIdeaGenerator userLocation={userLocation} partnerLocation={partnerLocation} />
        </div>
      </CardContent>
    </Card>
  );
}
