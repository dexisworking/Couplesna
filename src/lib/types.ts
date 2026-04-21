export type Location = {
  city: string;
  country: string;
  timezone: string;
  coords: {
    lat: number;
    lon: number;
  };
};

export type UserDetails = {
  anniversary: string;
  birthday: string;
  favoriteColor: string;
  favoriteSong: string;
};

export type UserMedia = {
  app: string;
  track: string;
};

export type DashboardWeather = {
  condition: string;
  tempCelsius: number;
  icon: 'Sunny' | 'Cloudy' | 'Windy' | 'Rainy' | 'Snowy';
};

export type DashboardPerson = {
  id: string;
  name: string;
  email?: string | null;
  username: string;
  profilePic: string;
  location: Location;
  details: UserDetails;
  media?: UserMedia | null;
  role?: string | null;
};

export type User = DashboardPerson;

export type Partner = DashboardPerson & {
  weather: DashboardWeather | null;
};

export type GalleryImage = {
  id?: string;
  url: string;
  hint: string;
  storagePath?: string;
};

export type GalleryCategory = {
  id: string;
  title: string;
  slug?: string;
  images: GalleryImage[];
};

export type DashboardData = {
  user: User;
  partner: Partner;
  coupleId: string | null;
  nextMeetDate: string;
  notes: {
    user: string;
    partner: string;
  };
  distanceApartKm: number;
  gallery: GalleryCategory[];
};

export type ConnectionInvite = {
  id: string;
  direction: 'incoming' | 'outgoing';
  otherProfileId: string;
  otherName: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
  createdAt: string;
};

export type AppDataSnapshot = {
  dashboard: DashboardData;
  coupleId: string | null;
  invites: ConnectionInvite[];
};
