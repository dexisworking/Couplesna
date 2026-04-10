import type { DashboardWeather, Location } from '@/lib/types';

const WEATHER_CODE_MAP: Record<number, DashboardWeather> = {
  0: { condition: 'Clear', tempCelsius: 0, icon: 'Sunny' },
  1: { condition: 'Mostly Clear', tempCelsius: 0, icon: 'Sunny' },
  2: { condition: 'Partly Cloudy', tempCelsius: 0, icon: 'Cloudy' },
  3: { condition: 'Overcast', tempCelsius: 0, icon: 'Cloudy' },
  45: { condition: 'Foggy', tempCelsius: 0, icon: 'Cloudy' },
  48: { condition: 'Foggy', tempCelsius: 0, icon: 'Cloudy' },
  51: { condition: 'Light Drizzle', tempCelsius: 0, icon: 'Rainy' },
  53: { condition: 'Drizzle', tempCelsius: 0, icon: 'Rainy' },
  55: { condition: 'Heavy Drizzle', tempCelsius: 0, icon: 'Rainy' },
  61: { condition: 'Rain', tempCelsius: 0, icon: 'Rainy' },
  63: { condition: 'Rain', tempCelsius: 0, icon: 'Rainy' },
  65: { condition: 'Heavy Rain', tempCelsius: 0, icon: 'Rainy' },
  71: { condition: 'Snow', tempCelsius: 0, icon: 'Snowy' },
  73: { condition: 'Snow', tempCelsius: 0, icon: 'Snowy' },
  75: { condition: 'Heavy Snow', tempCelsius: 0, icon: 'Snowy' },
  80: { condition: 'Rain Showers', tempCelsius: 0, icon: 'Rainy' },
  81: { condition: 'Rain Showers', tempCelsius: 0, icon: 'Rainy' },
  82: { condition: 'Heavy Showers', tempCelsius: 0, icon: 'Rainy' },
  95: { condition: 'Thunderstorm', tempCelsius: 0, icon: 'Windy' },
};

export async function getWeatherForLocation(location?: Location | null) {
  if (!location?.coords) {
    return null;
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.coords.lat));
  url.searchParams.set('longitude', String(location.coords.lon));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('timezone', 'auto');

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Weather request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };

    const current = payload.current;
    if (!current || current.temperature_2m === undefined || current.weather_code === undefined) {
      return null;
    }

    const template = WEATHER_CODE_MAP[current.weather_code] || {
      condition: 'Current Weather',
      tempCelsius: 0,
      icon: 'Sunny' as const,
    };

    return {
      ...template,
      tempCelsius: Math.round(current.temperature_2m),
    } satisfies DashboardWeather;
  } catch (error) {
    console.error('Weather provider error:', error);
    return null;
  }
}
