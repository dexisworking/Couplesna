import type { DashboardData } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const dashboardData: DashboardData = {
  user: {
    name: 'Alex',
    username: 'alex_92',
    profilePic: getImage('profile-user'),
    location: {
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
      coords: { lat: 40.7128, lon: -74.0060 },
    },
    details: {
      anniversary: '2022-06-15',
      birthday: '1992-09-20',
      favoriteColor: 'Forest Green',
      favoriteSong: 'Vienna - Billy Joel',
    },
  },
  partner: {
    name: 'Casey',
    username: 'casey_codes',
    profilePic: getImage('profile-partner'),
    location: {
      city: 'London',
      country: 'UK',
      timezone: 'Europe/London',
      coords: { lat: 51.5072, lon: -0.1276 },
    },
    weather: {
      condition: 'Partly Cloudy',
      tempCelsius: 18,
      icon: 'Cloudy',
    },
    media: {
      app: 'Spotify',
      track: 'Golden Hour - Kacey Musgraves',
    },
    details: {
      anniversary: '2022-06-15',
      birthday: '1993-04-10',
      favoriteColor: 'Lavender',
      favoriteSong: 'Here Comes The Sun - The Beatles',
    },
  },
  coupleId: 'TGCPL12345',
  nextMeetDate: new Date(new Date().getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  notes: {
    user: "Can't wait to see you! I was thinking we could go to that new Italian place.",
    partner: "Counting down every second! And yes to Italian, I'm already dreaming about it. ❤️",
  },
  distanceApartKm: 5566,
  gallery: [
    {
      id: 'us-together',
      title: 'Us Together',
      images: [
        { url: 'https://picsum.photos/seed/us1/800/600', hint: 'couple smiling' },
        { url: 'https://picsum.photos/seed/us2/800/600', hint: 'couple beach' },
        { url: 'https://picsum.photos/seed/us3/800/600', hint: 'couple city' },
      ],
    },
    {
      id: 'cute-moments',
      title: 'Cute Moments',
      images: [
        { url: 'https://picsum.photos/seed/cute1/800/600', hint: 'couple laughing' },
        { url: 'https://picsum.photos/seed/cute2/800/600', hint: 'couple picnic' },
        { url: 'https://picsum.photos/seed/cute3/800/600', hint: 'couple pets' },
      ],
    },
    {
      id: 'our-trips',
      title: 'Our Trips',
      images: [
        { url: 'https://picsum.photos/seed/trip1/800/600', hint: 'couple mountains' },
        { url: 'https://picsum.photos/seed/trip2/800/600', hint: 'couple travel' },
        { url: 'https://picsum.photos/seed/trip3/800/600', hint: 'couple sightseeing' },
      ],
    },
    {
      id: 'favorite-portraits',
      title: 'Favorite Portraits',
      images: [
        { url: 'https://picsum.photos/seed/port1/800/600', hint: 'portrait woman' },
        { url: 'https://picsum.photos/seed/port2/800/600', hint: 'portrait man' },
        { url: 'https://picsum.photos/seed/port3/800/600', hint: 'portrait smile' },
      ],
    },
  ],
};
