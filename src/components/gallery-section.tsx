'use client';

import * as React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Lock, Trash2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GalleryCategory } from '@/lib/types';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

const AlbumTile = ({
  category,
  onClick,
}: {
  category: GalleryCategory;
  onClick: () => void;
}) => {
  const firstImage =
    category.images[0]?.url || 'https://placehold.co/400x400/1e1e1e/333333?text=+';

  return (
    <div
      onClick={onClick}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-cover bg-center transition-transform duration-300 ease-in-out hover:scale-[1.02]"
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && onClick()}
    >
      <Image
        src={firstImage}
        alt={category.title}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-xs text-white">
        {category.images.length}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 text-sm font-semibold text-white md:p-4 md:text-base">
        {category.title}
      </div>
    </div>
  );
};

export default function GallerySection() {
  const { data, refreshData, isSynced } = useAppContext();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const gallery = React.useMemo(() => data?.gallery || [], [data?.gallery]);
  const activeCategory = React.useMemo(
    () => gallery.find((category) => category.id === activeCategoryId) || null,
    [activeCategoryId, gallery]
  );

  const isLocked = true; // Feature locked as requested

  const currentImage = activeCategory?.images[currentImageIndex];

  const openModal = () => {
    if (isLocked) {
      toast({
        title: 'Feature Locked',
        description: 'Shared Gallery is coming soon to Couplesna.',
      });
      return;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCategoryId(null);
    setCurrentImageIndex(0);
  };

  const showImage = (index: number) => {
    if (!activeCategory || activeCategory.images.length === 0) {
      return;
    }

    const nextIndex = (index + activeCategory.images.length) % activeCategory.images.length;
    setCurrentImageIndex(nextIndex);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !activeCategory) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('albumId', activeCategory.id);
      Array.from(files).forEach((file) => formData.append('files', file));

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Upload failed.');
      }

      await refreshData();
      toast({
        title: 'Images uploaded',
        description: 'Your new moments are now stored in your shared gallery.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      event.target.value = '';
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImage?.id) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/gallery/${currentImage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Delete failed.');
      }

      await refreshData();
      setCurrentImageIndex((value) => Math.max(0, value - 1));
      toast({
        title: 'Image removed',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  React.useEffect(() => {
    if (activeCategory && activeCategory.images.length === 0) {
      closeModal();
    }
  }, [activeCategory]);

  return (
    <>
      <div className="mb-4 text-center text-sm text-white/60">
        {isSynced
          ? 'Open an album to upload or remove photos.'
          : 'Connect with your partner to unlock persistent photo uploads.'}
      </div>
      <div className="relative">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4 overflow-hidden rounded-xl">
          {gallery.map((category) => (
            <AlbumTile key={category.id} category={category} onClick={() => openModal()} />
          ))}
        </div>

        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-[2px] border border-white/5 space-y-3">
             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Lock className="w-6 h-6 text-primary" />
             </div>
             <div className="text-center">
                <p className="text-lg font-bold text-white tracking-tight">Shared Vaults</p>
                <p className="text-sm text-white/60">Coming Soon</p>
             </div>
          </div>
        )}
      </div>

      {isModalOpen && activeCategory && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="flex h-screen w-screen max-w-none items-center justify-center border-0 bg-black/90 p-0 backdrop-blur-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="absolute right-4 top-4 z-50 text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>

            {activeCategory.images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => showImage(currentImageIndex - 1)}
                className="absolute left-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-10 md:p-3"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            )}

            <div className="relative flex max-w-[92vw] flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage?.url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="max-h-[76vh] max-w-[90vw] md:max-w-[80vw]"
                >
                  {currentImage && (
                    <Image
                      src={currentImage.url}
                      alt={activeCategory.title}
                      width={1200}
                      height={800}
                      className="rounded-lg object-contain shadow-2xl"
                      data-ai-hint={currentImage.hint}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-6 md:gap-4">
                <p className="font-mono text-sm text-white/80">
                  {activeCategory.images.length === 0 ? '0 / 0' : `${currentImageIndex + 1} / ${activeCategory.images.length}`}
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="h-9 px-3 text-xs"
                  disabled={!isSynced || isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-3 w-3" />
                  )}
                  Add
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                  className="h-9 px-3 text-xs"
                  disabled={!isSynced || isDeleting || !currentImage?.id}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-3 w-3" />
                  )}
                  Delete
                </Button>
              </div>
            </div>

            {activeCategory.images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => showImage(currentImageIndex + 1)}
                className="absolute right-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-10 md:p-3"
              >
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
