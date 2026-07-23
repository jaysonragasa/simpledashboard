import React, { useEffect, useRef, useState } from 'react';
import { Tile } from './Tile';
import type { TileColor, TileSize } from './Tile';

interface ClockTileProps {
  color?: TileColor;
  size?: TileSize;
}

export const ClockTile: React.FC<ClockTileProps> = ({ color = 'orange', size = 'normal' }) => {
  const [time, setTime] = useState(new Date());
  const requestRef = useRef<number>(0);

  const updateTime = () => {
    setTime(new Date());
    requestRef.current = requestAnimationFrame(updateTime);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateTime);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Calculate angles
  // Second hand should be smooth: include milliseconds
  const seconds = time.getSeconds() + time.getMilliseconds() / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = time.getHours() % 12 + minutes / 60;

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30;

  return (
    <Tile color={color} size={size}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '80%',
          height: '80%',
          maxWidth: '120px',
          maxHeight: '120px',
          borderRadius: '50%',
          border: '2px solid var(--tile-text-color)'
        }}>
          {/* Hour Hand */}
          <div style={{
            position: 'absolute',
            top: '25%', left: '48.5%',
            width: '3%', height: '25%',
            backgroundColor: 'var(--tile-text-color)',
            transformOrigin: 'bottom center',
            transform: `rotate(${hourAngle}deg)`
          }} />
          {/* Minute Hand */}
          <div style={{
            position: 'absolute',
            top: '10%', left: '49%',
            width: '2%', height: '40%',
            backgroundColor: 'var(--tile-text-color)',
            transformOrigin: 'bottom center',
            transform: `rotate(${minuteAngle}deg)`
          }} />
          {/* Second Hand */}
          <div style={{
            position: 'absolute',
            top: '5%', left: '49.5%',
            width: '1%', height: '45%',
            backgroundColor: '#ff4444',
            transformOrigin: 'bottom center',
            transform: `rotate(${secondAngle}deg)`
          }} />
          {/* Center Dot */}
          <div style={{
            position: 'absolute',
            top: '47%', left: '47%',
            width: '6%', height: '6%',
            backgroundColor: 'var(--tile-text-color)',
            borderRadius: '50%'
          }} />
        </div>
      </div>
    </Tile>
  );
};
