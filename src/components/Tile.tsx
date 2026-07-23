import React, { forwardRef } from 'react';

export type TileColor = 'blue' | 'green' | 'orange' | 'red' | 'purple';
export type TileSize = 'normal' | 'wide' | 'large';

interface TileProps {
  children: React.ReactNode;
  title?: string;
  color?: TileColor;
  size?: TileSize;
  onClick?: () => void;
  expanded?: boolean;
  flipped?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const colorMap: Record<TileColor, string> = {
  blue: 'var(--tile-blue)',
  green: 'var(--tile-green)',
  orange: 'var(--tile-orange)',
  red: 'var(--tile-red)',
  purple: 'var(--tile-purple)',
};

export const Tile = forwardRef<HTMLDivElement, TileProps & React.HTMLAttributes<HTMLDivElement>>(({
  children, 
  title, 
  color = 'blue', 
  size = 'normal',
  onClick,
  expanded = false,
  flipped = false,
  style,
  className = '',
  ...rest
}, ref) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: colorMap[color],
    ...style,
  };

  const classes = [
    'live-tile',
    size !== 'normal' ? size : '',
    expanded ? 'expanded tile-fullscreen' : '',
    flipped ? 'flipped' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} style={baseStyle} onClick={onClick} {...rest}>
      {children}
      {title && !expanded && (
        <div className="tile-content" style={{ pointerEvents: 'none' }}>
          <span className="tile-title">{title}</span>
        </div>
      )}
    </div>
  );
});
