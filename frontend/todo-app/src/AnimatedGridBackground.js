import React, { useState, useEffect } from 'react';
import 'animate.css';
import './AnimatedGridBackground.css';

const AnimatedGridBackground = () => {
  const tileWidth = 20;
  const tileHeight = 20;

  const [cols, setCols] = useState(Math.ceil(window.innerWidth / tileWidth));
  const [rows, setRows] = useState(Math.ceil(window.innerHeight / tileHeight));

  useEffect(() => {
    const handleResize = () => {
      setCols(Math.ceil(window.innerWidth / tileWidth));
      setRows(Math.ceil(window.innerHeight / tileHeight));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tileWidth, tileHeight]);

  const totalTiles = cols * rows;
  const gridArray = Array.from({ length: totalTiles });

  const palette = [
    "#ff00ff",  // Magenta
    "#00ffff",  // Cyan
    "#ffff00",  // Yellow
    "#ff6600",  // Orange
    "#66ff66",  // Lime green
    "#ff007f",  // Rose
    "#7f00ff",  // Violet
    "#00ff00"   // Bright Green
  ];

  const getRandomPaletteColor = () => {
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const [trails, setTrails] = useState([]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const randomBrightColor = getRandomPaletteColor();
    const newTrail = { id: `${Date.now()}-${Math.random()}`, x, y, color: randomBrightColor };
    setTrails((prev) => [...prev, newTrail]);
    setTimeout(() => {
      setTrails((prev) => prev.filter(trail => trail.id !== newTrail.id));
    }, 500);
  };

  const changeTileColor = (e) => {
    const tile = e.currentTarget;
    const randomColor = getRandomPaletteColor();
    tile.style.backgroundColor = randomColor;
    tile.style.boxShadow = `0 0 8px ${randomColor}`;
    tile.classList.add("animate__animated", "animate__pulse");
    setTimeout(() => {
      tile.classList.remove("animate__animated", "animate__pulse");
      tile.style.backgroundColor = "#111";
      tile.style.boxShadow = "none";
    }, 500);
  };

  return (
    <div
      className="animated-grid-background"
      onMouseMove={handleMouseMove}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {gridArray.map((_, idx) => (
        <div key={idx} className="grid-tile" onMouseEnter={changeTileColor}></div>
      ))}
      {trails.map(trail => (
        <div
          key={trail.id}
          className="cursor-trail animate__animated animate__fadeOut"
          style={{ left: trail.x, top: trail.y, backgroundColor: trail.color }}
        ></div>
      ))}
    </div>
  );
};

export default AnimatedGridBackground;
