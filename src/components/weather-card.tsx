import { Sun, Cloudy, Wind, Umbrella, Snowflake, Loader2 } from 'lucide-react';
import type { Partner } from '@/lib/types';
import Image from 'next/image';

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
      <div id="weather-widget" className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full pl-2 pr-3 py-2 border border-white/10 text-white text-sm">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span id="weather-temp">--°C</span>
      </div>
    );
  }

  const Icon = weatherIcons[weather.icon] || Sun;

  return (
    <div id="weather-widget" className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full pl-2 pr-3 py-2 border border-white/10 text-white text-sm">
      <Icon className="w-8 h-8 text-yellow-300" />
      <span id="weather-temp">{weather.tempCelsius}°C</span>
    </div>
  );
}
