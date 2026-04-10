import { Sun, Cloudy, Wind, Umbrella, Snowflake, Loader2 } from 'lucide-react';
import type { Partner } from '@/lib/types';

interface WeatherCardProps {
  weather: Partner['weather'];
}

const weatherIcons: { [key: string]: React.ElementType } = {
  Sunny: Sun,
  Cloudy: Cloudy,
  Windy: Wind,
  Rainy: Umbrella,
  Snowy: Snowflake,
};

export default function WeatherCard({ weather }: WeatherCardProps) {
  if (!weather) {
    return (
      <div id="weather-widget" className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white backdrop-blur-md">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span id="weather-temp">Weather loading...</span>
      </div>
    );
  }

  const Icon = weatherIcons[weather.icon] || Sun;

  return (
    <div id="weather-widget" className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white backdrop-blur-md">
      <Icon className="h-5 w-5 text-yellow-300" />
      <span id="weather-temp">{weather.tempCelsius}°C</span>
      <span className="hidden text-white/70 sm:inline">{weather.condition}</span>
    </div>
  );
}
