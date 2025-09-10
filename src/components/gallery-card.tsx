'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryCategory } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GalleryCardProps {
  category: GalleryCategory;
}

export default function GalleryCard({ category }: GalleryCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    if (category.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % category.images.length);
      }, 5000); // Change image every 5 seconds for a smoother feel
      return () => clearInterval(interval);
    }
  }, [category.images.length]);

  const currentImage = category.images[currentImageIndex];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group aspect-square relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
          <AnimatePresence>
            <motion.div
              key={currentImage.url}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={currentImage.url}
                alt={category.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
                data-ai-hint={currentImage.hint}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-2xl font-bold font-headline text-white drop-shadow-md">{category.title}</h3>
          </div>
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{category.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2">
            {category.images.map((img, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden">
                <Image 
                  src={img.url}
                  alt={`${category.title} - ${index + 1}`}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                  data-ai-hint={img.hint}
                />
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
