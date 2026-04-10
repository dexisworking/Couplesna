import type {
  DashboardData,
  DashboardPerson,
  GalleryCategory,
  Location,
  Partner,
  User,
  UserDetails,
  UserMedia,
} from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

const defaultLocation = (location?: Partial<Location>): Location => ({
  city: location?.city || 'Unknown City',
  country: location?.country || 'Unknown Country',
  timezone: location?.timezone || 'UTC',
  coords: {
    lat: location?.coords?.lat ?? 0,
    lon: location?.coords?.lon ?? 0,
  },
});

const defaultDetails = (details?: Partial<UserDetails>): UserDetails => ({
  anniversary: details?.anniversary || '2022-06-15',
  birthday: details?.birthday || '1992-09-20',
  favoriteColor: details?.favoriteColor || 'Forest Green',
  favoriteSong: details?.favoriteSong || 'Vienna - Billy Joel',
});

const defaultMedia = (media?: Partial<UserMedia>): UserMedia => ({
  app: media?.app || 'Spotify',
  track: media?.track || 'Golden Hour - Kacey Musgraves',
});

export function buildDefaultGallery(): GalleryCategory[] {
  return [
    {
      id: 'demo-us-together',
      slug: 'us-together',
      title: 'Us Together',
      images: [
        { url: 'https://picsum.photos/seed/us1/800/600', hint: 'couple smiling' },
        { url: 'https://picsum.photos/seed/us2/800/600', hint: 'couple beach' },
        { url: 'https://picsum.photos/seed/us3/800/600', hint: 'couple city' },
      ],
    },
    {
      id: 'demo-cute-moments',
      slug: 'cute-moments',
      title: 'Cute Moments',
      images: [
        { url: 'https://picsum.photos/seed/cute1/800/600', hint: 'couple laughing' },
        { url: 'https://picsum.photos/seed/cute2/800/600', hint: 'couple picnic' },
        { url: 'https://picsum.photos/seed/cute3/800/600', hint: 'couple pets' },
      ],
    },
    {
      id: 'demo-our-trips',
      slug: 'our-trips',
      title: 'Our Trips',
      images: [
        { url: 'https://picsum.photos/seed/trip1/800/600', hint: 'couple mountains' },
        { url: 'https://picsum.photos/seed/trip2/800/600', hint: 'couple travel' },
        { url: 'https://picsum.photos/seed/trip3/800/600', hint: 'couple sightseeing' },
      ],
    },
    {
      id: 'demo-favorite-portraits',
      slug: 'favorite-portraits',
      title: 'Favorite Portraits',
      images: [
        { url: 'https://picsum.photos/seed/port1/800/600', hint: 'portrait woman' },
        { url: 'https://picsum.photos/seed/port2/800/600', hint: 'portrait man' },
        { url: 'https://picsum.photos/seed/port3/800/600', hint: 'portrait smile' },
      ],
    },
  ];
}

const demoUser: User = {
  id: 'demo-user',
  name: 'Alex',
  username: 'alex_92',
  email: 'alex@example.com',
  profilePic: getImage('profile-user'),
  location: defaultLocation({
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    coords: { lat: 40.7128, lon: -74.006 },
  }),
  details: defaultDetails(),
  media: defaultMedia(),
};

const demoPartner: Partner = {
  id: 'demo-partner',
  name: 'Casey',
  username: 'casey_codes',
  email: 'casey@example.com',
  profilePic: getImage('profile-partner'),
  location: defaultLocation({
    city: 'London',
    country: 'UK',
    timezone: 'Europe/London',
    coords: { lat: 51.5072, lon: -0.1276 },
  }),
  weather: {
    condition: 'Partly Cloudy',
    tempCelsius: 18,
    icon: 'Cloudy',
  },
  media: defaultMedia({
    track: 'Here Comes The Sun - The Beatles',
  }),
  details: defaultDetails({
    birthday: '1993-04-10',
    favoriteColor: 'Lavender',
    favoriteSong: 'Here Comes The Sun - The Beatles',
  }),
};

export const dashboardData: DashboardData = {
  user: demoUser,
  partner: demoPartner,
  coupleId: 'demo-couple',
  nextMeetDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  notes: {
    user: "Can't wait to see you! I was thinking we could go to that new Italian place.",
    partner: "Counting down every second! And yes to Italian, I'm already dreaming about it.",
  },
  distanceApartKm: 5566,
  gallery: buildDefaultGallery(),
};

function mergePerson(
  base: DashboardPerson,
  overrides?: Partial<DashboardPerson>
): DashboardPerson {
  return {
    ...base,
    ...overrides,
    name: overrides?.name || base.name,
    username: overrides?.username || base.username,
    profilePic: overrides?.profilePic || base.profilePic,
    location: defaultLocation(overrides?.location || base.location),
    details: defaultDetails(overrides?.details || base.details),
    media: defaultMedia(overrides?.media || base.media || undefined),
  };
}

export function buildFallbackDashboard(profile?: Partial<DashboardPerson>): DashboardData {
  const user = mergePerson(demoUser, profile);

  return {
    ...dashboardData,
    user,
    coupleId: null,
  };
}
