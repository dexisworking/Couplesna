
'use client';
import * as React from 'react';
import Image from 'next/image';
import type { GalleryCategory, GalleryImage } from '@/lib/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Upload, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

const AlbumTile = ({ category, onClick }: { category: GalleryCategory; onClick: () => void }) => {
  const firstImage = category.images[0]?.url || 'https://placehold.co/400x400/1e1e1e/333333?text=+';

  return (
    <div
      onClick={onClick}
      className="album-tile group aspect-square bg-cover bg-center rounded-xl cursor-pointer relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <Image
        src={firstImage}
        alt={category.title}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full border border-white/10">
        {category.images.length}
      </div>
      <div className="album-title absolute bottom-0 left-0 right-0 p-2 md:p-4 text-sm md:text-base font-semibold text-white">
        {category.title}
      </div>
    </div>
  );
};

export default function GallerySection() {
  const { data, setData } = useAppContext();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<GalleryCategory | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const gallery = data?.gallery || [];

  const updateGallery = async (newGallery: GalleryCategory[]) => {
    try {
      await setData({ gallery: newGallery });
    } catch (e) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the gallery. Please try again."
      });
    }
  };

  const openModal = (category: GalleryCategory) => {
    const categoryFromState = gallery.find(c => c.id === category.id) || category;
    setActiveCategory(categoryFromState);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCategory(null);
  };

  const showImage = (index: number) => {
    if (!activeCategory) return;
    const newIndex = (index + activeCategory.images.length) % activeCategory.images.length;
    setCurrentImageIndex(newIndex);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !activeCategory) return;

    const newImages: GalleryImage[] = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      hint: 'new upload',
    }));
    
    const newGallery = gallery.map(cat => {
      if (cat.id === activeCategory.id) {
        const updatedCategory = { ...cat, images: [...cat.images, ...newImages] };
        setActiveCategory(updatedCategory);
        return updatedCategory;
      }
      return cat;
    });

    updateGallery(newGallery);
    toast({ title: "Images added!", description: "Your new moments are now shared."});
  };

  const handleDelete = () => {
     if (!activeCategory) return;
      const updatedImages = [...activeCategory.images];
      updatedImages.splice(currentImageIndex, 1);
      
      const newGallery = gallery.map(cat => {
        if (cat.id === activeCategory.id) {
          const updatedCategory = { ...cat, images: updatedImages };
          setActiveCategory(updatedCategory); // Update active category for UI
          
          // Show the previous image or the first one
          setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
          
          if (updatedImages.length === 0) {
            closeModal();
          }
          return updatedCategory;
        }
        return cat;
      });

      updateGallery(newGallery);
      toast({ title: "Image removed", variant: 'destructive'});
  };

  const currentImage = activeCategory?.images[currentImageIndex];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {gallery.map(category => (
          <AlbumTile key={category.id} category={category} onClick={() => openModal(category)} />
        ))}
      </div>
      
      {isModalOpen && activeCategory && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-black/90 border-0 max-w-none w-screen h-screen p-0 flex items-center justify-center backdrop-blur-lg">
            <Button variant="ghost" size="icon" onClick={closeModal} className="absolute top-4 right-4 text-white hover:bg-white/10 z-50">
              <X className="h-6 w-6" />
            </Button>
            
            {activeCategory.images.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => showImage(currentImageIndex - 1)} className="absolute left-4 md:left-10 text-white p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 z-50">
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            )}

            <div className="relative flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage?.url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="max-h-[80vh] max-w-[90vw] md:max-w-[80vw]"
                >
                  {currentImage && (
                     <Image
                      src={currentImage.url}
                      alt={activeCategory.title}
                      width={1200}
                      height={800}
                      className="object-contain rounded-lg shadow-2xl"
                      data-ai-hint={currentImage.hint}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div id="carousel-actions" className="mt-4 md:mt-6 flex items-center gap-2 md:gap-4">
                <p id="carouselCounter" className="text-white/80 text-sm font-mono">
                  {currentImageIndex + 1} / {activeCategory.images.length}
                </p>
                <Button onClick={() => fileInputRef.current?.click()} size="sm" className="text-xs px-3 h-8">
                  <Upload className="mr-1 h-3 w-3" /> Add
                </Button>
                <Button onClick={handleDelete} variant="destructive" size="sm" className="text-xs px-3 h-8">
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
            
            {activeCategory.images.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => showImage(currentImageIndex + 1)} className="absolute right-4 md:right-10 text-white p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 z-50">
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleUpload}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
