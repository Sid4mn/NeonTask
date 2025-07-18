import React, { useState, useEffect } from 'react';
import 'animate.css';
import './AnimatedGridBackground.css';

const AnimatedGridBackground = () => {
  const gridSize = 20;
  const [gridCols, setGridCols] = useState(Math.ceil(window.innerWidth / gridSize));
  const [gridRows, setGridRows] = useState(Math.ceil(window.innerHeight / gridSize));
  const [mouseTrails, setMouseTrails] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const updateGrid = () => {
      setGridCols(Math.ceil(window.innerWidth / gridSize));
      setGridRows(Math.ceil(window.innerHeight / gridSize));
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', updateGrid);
    return () => window.removeEventListener('resize', updateGrid);
  }, []);

  const totalGridSquares = gridCols * gridRows;
  const gridSquares = Array.from({ length: totalGridSquares });

  const colors = [
    "#ff00ff", "#00ffff", "#ffff00", "#ff6600",
    "#66ff66", "#ff007f", "#7f00ff", "#00ff00"
  ];

  const pickRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  // Mouse movement creates trails
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = pickRandomColor();
    
    const trail = { id: Date.now() + Math.random(), x, y, color };
    setMouseTrails(prev => [...prev, trail]);
    
    // Clean up trail after half a second
    setTimeout(() => {
      setMouseTrails(prev => prev.filter(t => t.id !== trail.id));
    }, 500);
  };

  // Light up grid squares on hover (disabled on mobile for better performance)
  const lightUpSquare = (e) => {
    if (isMobile) return; // Disable hover effects on mobile
    
    const square = e.currentTarget;
    const color = pickRandomColor();
    
    square.style.backgroundColor = color;
    square.style.boxShadow = `0 0 8px ${color}`;
    square.classList.add("animate__animated", "animate__pulse");
    
    setTimeout(() => {
      square.classList.remove("animate__animated", "animate__pulse");
      square.style.backgroundColor = "#111";
      square.style.boxShadow = "none";
    }, 500);
  };

  return (
    <div
      className="animated-grid-background"
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`
      }}
    >
      {gridSquares.map((_, idx) => (
        <div 
          key={idx} 
          className="grid-tile" 
          onMouseEnter={!isMobile ? lightUpSquare : undefined}
        ></div>
      ))}
      
      {!isMobile && mouseTrails.map(trail => (
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
