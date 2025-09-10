import { dashboardData } from '@/lib/data';
import GalleryCard from './gallery-card';

export default function GallerySection() {
  const { gallery } = dashboardData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {gallery.map((category) => (
        <GalleryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
