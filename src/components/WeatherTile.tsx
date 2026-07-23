import React, { useEffect, useState } from 'react';
import { Tile } from './Tile';
import type { TileColor, TileSize } from './Tile';
import { fetchWeatherData, getUserLocation, getWeatherDescription } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, X } from 'lucide-react';

interface WeatherTileProps {
  color?: TileColor;
  size?: TileSize;
}

export const WeatherTile: React.FC<WeatherTileProps> = ({ color = 'blue', size = 'large' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const { lat, lon } = await getUserLocation();
        const data = await fetchWeatherData(lat, lon);
        setWeather(data);
      } catch (error) {
        console.error("Failed to load weather", error);
      } finally {
        setLoading(false);
      }
    };
    loadWeather();

    // Auto-flip every 10 seconds if not expanded
    const interval = setInterval(() => {
      setFlipped(f => !f);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (!expanded) {
      setExpanded(true);
      setFlipped(false); // Reset flip when expanding
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tile click
    setExpanded(false);
  };

  const getWeatherIcon = (code: number, size = 48, animating = false) => {
    const style = animating ? { animation: 'sun-spin 10s linear infinite' } : {};
    const driftStyle = animating ? { animation: 'cloud-drift 8s ease-in-out infinite' } : {};
    const rainStyle = animating ? { animation: 'rain-drop 1s linear infinite' } : {};

    if (code === 0) return <Sun size={size} style={style} />;
    if (code > 0 && code <= 3) return <Cloud size={size} style={driftStyle} />;
    if (code >= 51 && code <= 67) return (
       <div style={{ position: 'relative' }}>
          <Cloud size={size} style={{ position: 'relative', zIndex: 2 }} />
          <CloudRain size={size} style={{ position: 'absolute', top: 10, left: 0, zIndex: 1, ...rainStyle }} />
       </div>
    );
    if (code >= 71 && code <= 77) return <CloudSnow size={size} />;
    if (code >= 80 && code <= 82) return <CloudRain size={size} />;
    if (code >= 95 && code <= 99) return <CloudLightning size={size} />;
    return <Sun size={size} />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading || !weather) {
    return (
      <Tile color={color} size={size}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          Loading...
        </div>
      </Tile>
    );
  }

  // Back face: 3-day forecast
  const renderBackFace = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 400 }}>3-Day Forecast</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          {[1, 2, 3].map((dayIndex) => (
            <div key={dayIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{formatDate(weather.daily.time[dayIndex])}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 {getWeatherIcon(weather.daily.weatherCode[dayIndex], 20)}
                 <span>{Math.round(weather.daily.maxTemp[dayIndex])}° / {Math.round(weather.daily.minTemp[dayIndex])}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Tile 
      color={color} 
      size={size} 
      expanded={expanded} 
      flipped={expanded ? false : flipped}
      onClick={handleClick}
    >
      <div className="flip-container">
        {/* Front Face */}
        <div className="flip-front">
          <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', height: '100%' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1 }}>
                 {Math.round(weather.current.temperature)}°
               </div>
               <div>
                 {getWeatherIcon(weather.current.weatherCode, 64, true)}
               </div>
             </div>
             <div style={{ marginTop: 'auto', fontSize: '1.2rem' }}>
               {getWeatherDescription(weather.current.weatherCode)}
             </div>
          </div>
        </div>
        
        {/* Back Face */}
        <div className="flip-back">
          {renderBackFace()}
        </div>
      </div>

      {/* Fullscreen Mode Content overlay */}
      {expanded && (
        <div className="fullscreen-weather-content" style={{
           position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
           background: 'var(--tile-blue)',
           zIndex: 2000
        }}>
           <button className="close-button" onClick={handleClose}>
             <X size={24} />
           </button>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              {getWeatherIcon(weather.current.weatherCode, 80, true)}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <h1>{Math.round(weather.current.temperature)}°C</h1>
                 <h2 style={{ margin: 0, opacity: 0.9 }}>{getWeatherDescription(weather.current.weatherCode)}</h2>
              </div>
           </div>
           

           <div className="forecast-5day">
             {[1, 2, 3, 4, 5].map((dayIndex) => (
               <div key={dayIndex} className="forecast-item">
                  <span style={{ fontWeight: 600 }}>{formatDate(weather.daily.time[dayIndex])}</span>
                  {getWeatherIcon(weather.daily.weatherCode[dayIndex], 32)}
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ opacity: 0.9 }}>{Math.round(weather.daily.maxTemp[dayIndex])}°</span>
                    {' '}
                    <span style={{ opacity: 0.6 }}>{Math.round(weather.daily.minTemp[dayIndex])}°</span>
                  </div>
               </div>
             ))}
           </div>

           <div style={{ flex: 1, width: '100%', maxWidth: '800px', marginTop: '30px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
             <iframe 
               width="100%" 
               height="100%" 
               src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km/h&zoom=9&overlay=rain&product=ecmwf&level=surface&lat=${weather.lat}&lon=${weather.lon}`} 
               frameBorder="0"
               style={{ border: 0 }}
             ></iframe>
           </div>
        </div>
      )}
      
    </Tile>
  );
};
