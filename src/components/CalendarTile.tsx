import React from 'react';
import { Tile } from './Tile';
import type { TileColor, TileSize } from './Tile';

interface CalendarTileProps {
  color?: TileColor;
  size?: TileSize;
}

export const CalendarTile: React.FC<CalendarTileProps> = ({ color = 'green', size = 'large' }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayDate = now.getDate();

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const monthName = now.toLocaleString('default', { month: 'long' });

  // Generate grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  return (
    <Tile color={color} size={size}>
      <div style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>
          {monthName} {currentYear}
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '2px', 
          flex: 1,
          alignItems: 'center',
          justifyItems: 'center'
        }}>
          {/* Days of week header */}
          {daysOfWeek.map((day, idx) => (
            <div key={`header-${idx}`} style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600 }}>
              {day}
            </div>
          ))}
          
          {/* Date cells */}
          {cells.map((date, idx) => (
            <div 
              key={`cell-${idx}`} 
              style={{
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                borderRadius: '50%',
                backgroundColor: date === todayDate ? 'var(--tile-text-color)' : 'transparent',
                color: date === todayDate ? 'var(--tile-blue)' : 'inherit',
                fontWeight: date === todayDate ? 600 : 400,
                opacity: date ? 1 : 0
              }}
            >
              {date}
            </div>
          ))}
        </div>
      </div>
    </Tile>
  );
};
