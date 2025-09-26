import type { LucideIcon } from 'lucide-react';

type Location = {
  city: string;
  country: string;
  timezone: string;
  coords: {
    lat: number;
    lon: number;
  };
};

type UserDetails = {
  anniversary: string;
  birthday: string;
  favoriteColor: string;
  favoriteSong: string;
};

export type User = {
  name: string;
  username: string;
  profilePic: string;
  location: Location;
  details: UserDetails;
};

export type Partner = {
  name: string;
  username: string;
  profilePic: string;
  location: Location;
  weather: {
    condition: string;
    tempCelsius: number;
    icon: string;
  };
  media: {
    app: string;
    track: string;
  };
  details: UserDetails;
};

export type GalleryImage = {
  url: string;
  hint: string;
};

export type GalleryCategory = {
  id: string;
  title: string;
  images: GalleryImage[];
};

export type DashboardData = {
  user: User;
  partner: Partner;
  coupleId: string;
  users?: string[];
  nextMeetDate: string;
  notes: {
    user: string;
    partner: string;
  };
  distanceApartKm: number;
  gallery: GalleryCategory[];
};
