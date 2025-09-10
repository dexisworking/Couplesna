'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { suggestDateIdeas } from '@/ai/flows/ai-suggested-date-ideas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';

interface DateIdeaGeneratorProps {
  userLocation: string;
  partnerLocation: string;
}

const formSchema = z.object({
  userLocation: z.string().min(1, 'Your location is required.'),
  partnerLocation: z.string().min(1, "Your partner's location is required."),
  mutualInterests: z.string().min(1, 'Please list some interests.'),
  maxDistanceMiles: z.coerce.number().int().positive().optional(),
});

export default function DateIdeaGenerator({ userLocation, partnerLocation }: DateIdeaGeneratorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [ideas, setIdeas] = React.useState<string[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userLocation: userLocation,
      partnerLocation: partnerLocation,
      mutualInterests: 'Movies, hiking, trying new food',
      maxDistanceMiles: 100,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIdeas(null);
    try {
      const result = await suggestDateIdeas(values);
      if (result.dateIdeas && result.dateIdeas.length > 0) {
        setIdeas(result.dateIdeas);
      } else {
        toast({
          variant: 'destructive',
          title: 'No ideas found',
          description: 'The AI could not generate ideas. Please try different interests.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get date ideas. Please try again later.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  
  React.useEffect(() => {
    if (isOpen) {
      setIdeas(null);
      form.reset({
        userLocation: userLocation,
        partnerLocation: partnerLocation,
        mutualInterests: 'Movies, hiking, trying new food',
        maxDistanceMiles: 100,
      });
    }
  }, [isOpen, userLocation, partnerLocation, form]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Get Date Ideas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Date Idea Generator</DialogTitle>
          <DialogDescription>
            Let AI suggest some fun date ideas based on your locations and interests.
          </DialogDescription>
        </DialogHeader>
        
        {!ideas && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mutualInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mutual Interests</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., hiking, movies, cooking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partnerLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner's Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" /> Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {ideas && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="font-semibold text-lg">Here are some ideas!</h3>
            <ul className="space-y-3">
              {ideas.map((idea, index) => (
                <li key={index}>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
                      <p className="text-sm">{idea}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
            <DialogFooter>
               <Button onClick={() => setIdeas(null)}>
                  <Wand2 className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
