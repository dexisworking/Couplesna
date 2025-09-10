import { Card, CardContent } from '@/components/ui/card';
import { Sun, Cloudy, Wind, Umbrella, Snowflake } from 'lucide-react';
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
  const Icon = weatherIcons[weather.icon] || Sun;

  return (
    <Card className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm shadow-xl">
      <CardContent className="p-4 flex items-center gap-4">
        <Icon className="h-10 w-10 text-primary" />
        <div>
          <p className="text-3xl font-bold">{weather.tempCelsius}°C</p>
          <p className="text-muted-foreground">{weather.condition}</p>
        </div>
      </CardContent>
    </Card>
  );
}
