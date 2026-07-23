export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    maxTemp: number[];
    minTemp: number[];
  };
  locationName?: string;
  lat: number;
  lon: number;
}

const API_KEY = '680689d339e80c5abb0e156187e87d9c';

// Helper to map OpenWeatherMap condition codes to our WMO-like codes
const mapOWMCodeToWMO = (owmCode: number): number => {
  if (owmCode >= 200 && owmCode < 300) return 95; // Thunderstorm
  if (owmCode >= 300 && owmCode < 400) return 51; // Drizzle
  if (owmCode >= 500 && owmCode < 600) return 61; // Rain
  if (owmCode >= 600 && owmCode < 700) return 71; // Snow
  if (owmCode >= 700 && owmCode < 800) return 45; // Fog/Atmosphere
  if (owmCode === 800) return 0; // Clear
  if (owmCode > 800) return 2; // Clouds
  return 0; // Default
};

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  // Fetch current weather
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const currentRes = await fetch(currentUrl);
  if (!currentRes.ok) throw new Error('Failed to fetch current weather');
  const currentData = await currentRes.json();

  // Fetch 5-day / 3-hour forecast
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
  const forecastData = await forecastRes.json();

  // Process the 3-hour forecast into daily aggregates
  const dailyMap = new Map<string, { max: number; min: number; code: number }>();
  
  forecastData.list.forEach((item: any) => {
    // extract just the date part (YYYY-MM-DD)
    const dateStr = item.dt_txt.split(' ')[0];
    const tempMax = item.main.temp_max;
    const tempMin = item.main.temp_min;
    const code = mapOWMCodeToWMO(item.weather[0].id);

    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, { max: tempMax, min: tempMin, code: code });
    } else {
      const existing = dailyMap.get(dateStr)!;
      existing.max = Math.max(existing.max, tempMax);
      existing.min = Math.min(existing.min, tempMin);
      // We could try to find the most common code, but keeping the first (midday if starts there) or worst is fine.
      // Let's just keep the worst weather (higher code usually means worse except clear/clouds)
      if (code > existing.code) {
        existing.code = code;
      }
      dailyMap.set(dateStr, existing);
    }
  });

  const dailyDates = Array.from(dailyMap.keys()).slice(0, 6);
  const dailyWeatherCodes: number[] = [];
  const dailyMaxTemps: number[] = [];
  const dailyMinTemps: number[] = [];

  dailyDates.forEach(date => {
    const data = dailyMap.get(date)!;
    dailyWeatherCodes.push(data.code);
    dailyMaxTemps.push(data.max);
    dailyMinTemps.push(data.min);
  });

  // isDay calculation based on sunrise/sunset
  const now = Math.floor(Date.now() / 1000);
  const isDay = now > currentData.sys.sunrise && now < currentData.sys.sunset;

  return {
    current: {
      temperature: currentData.main.temp,
      weatherCode: mapOWMCodeToWMO(currentData.weather[0].id),
      isDay,
    },
    daily: {
      time: dailyDates,
      weatherCode: dailyWeatherCodes,
      maxTemp: dailyMaxTemps,
      minTemp: dailyMinTemps,
    },
    locationName: currentData.name,
    lat,
    lon
  };
};

export const getUserLocation = (): Promise<{lat: number, lon: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      }, () => {
        // Fallback to Manila, Philippines if user/device denies permission
        resolve({ lat: 14.5995, lon: 120.9842 });
      });
    }
  });
};

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};
