export type MapProviderConfig = {
  provider: 'google';
  apiKey: string;
};

export function getMapProviderConfig(): MapProviderConfig {
  return {
    provider: 'google',
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  };
}

export function isMapProviderConfigured() {
  return Boolean(getMapProviderConfig().apiKey);
}
