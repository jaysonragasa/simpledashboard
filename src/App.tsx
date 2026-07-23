import { useState, useEffect } from 'react';
import { Tile } from './components/Tile';
import { ClockTile } from './components/ClockTile';
import { WeatherTile } from './components/WeatherTile';
import { CalendarTile } from './components/CalendarTile';
import { SortableTile } from './components/SortableTile';
import { Image as ImageIcon, Settings, Palette, Maximize, Minimize } from 'lucide-react';
import { DndContext, closestCenter, TouchSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

function App() {
  const [theme, setTheme] = useState<'colored' | 'paper' | 'dark'>(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return (saved === 'paper' || saved === 'colored' || saved === 'dark') ? saved : 'colored';
  });
  
  const [tiles, setTiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-tiles');
    const defaultTiles = ['clock', 'weather', 'calendar', 'photos', 'theme', 'settings'];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only valid tiles and append any newly added tiles that aren't in the saved list
          const validTiles = parsed.filter(t => defaultTiles.includes(t));
          const missingTiles = defaultTiles.filter(t => !validTiles.includes(t));
          return [...validTiles, ...missingTiles];
        }
      } catch (e) {
        console.error('Failed to parse saved tiles', e);
      }
    }
    return defaultTiles;
  });

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dashboard-tiles', JSON.stringify(tiles));
  }, [tiles]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    document.body.classList.remove('theme-paper', 'theme-dark');
    if (theme !== 'colored') {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'colored') return 'paper';
      if (prev === 'paper') return 'dark';
      return 'colored';
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTiles((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderTile = (id: string) => {
    switch (id) {
      case 'clock':
        return (
          <SortableTile key={id} id={id} size="normal">
            <ClockTile color="orange" size="normal" />
          </SortableTile>
        );
      case 'weather':
        return (
          <SortableTile key={id} id={id} size="wide">
            <WeatherTile color="blue" size="wide" />
          </SortableTile>
        );
      case 'calendar':
        return (
          <SortableTile key={id} id={id} size="large">
            <CalendarTile color="green" size="large" />
          </SortableTile>
        );
      case 'photos':
        return (
          <SortableTile key={id} id={id} size="wide">
            <Tile title="Photos" color="purple" size="wide">
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <ImageIcon size={64} opacity={0.8} />
              </div>
            </Tile>
          </SortableTile>
        );
      case 'theme':
        return (
          <SortableTile key={id} id={id} size="normal">
            <Tile title="Theme" color="green" size="normal" onClick={toggleTheme}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Palette size={48} style={{ marginBottom: '10px' }} />
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {theme === 'colored' ? 'Colored' : theme === 'paper' ? 'Paper LCD' : 'Dark Mode'}
                </div>
              </div>
            </Tile>
          </SortableTile>
        );
      case 'settings':
        return (
          <SortableTile key={id} id={id} size="normal">
            <Tile title="Settings" color="orange" size="normal">
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Settings size={48} />
              </div>
            </Tile>
          </SortableTile>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <button 
        onClick={toggleFullscreen}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--tile-bg, rgba(255, 255, 255, 0.1))',
          border: 'none',
          color: 'var(--text-color)',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tiles} strategy={rectSortingStrategy}>
          <div className="dashboard-grid">
            {tiles.map(id => renderTile(id))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}

export default App;
