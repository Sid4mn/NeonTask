import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AnimatedGridBackground from './AnimatedGridBackground';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [titleColors, setTitleColors] = useState([]);
  
  const animationRef = useRef(null);

  const appTitle = "Neon Task";
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8001";

  const neonColors = [
    "#ff00ff", "#00ffff", "#ffff00", "#ff6600", 
    "#66ff66", "#ff007f", "#7f00ff", "#00ff00"
  ];

  const getRandomColor = () => {
    return neonColors[Math.floor(Math.random() * neonColors.length)];
  };

  // Set up the animated title on first load
  useEffect(() => {
    const colors = appTitle.split("").map(() => getRandomColor());
    setTitleColors(colors);
  }, []);

  // Change title colors every half second for that flashy effect
  useEffect(() => {
    const colorTimer = setInterval(() => {
      setTitleColors(appTitle.split("").map(() => getRandomColor()));
    }, 500);
    return () => clearInterval(colorTimer);
  }, []);

  // Random position for new todos - keep them on screen and away from input area
  const randomPosition = () => {
    const isMobile = window.innerWidth <= 768;
    const safeZoneTop = isMobile ? 250 : 200; // More space on mobile for stacked layout
    const safeZoneBottom = 100;
    const safeZoneSides = isMobile ? 20 : 50; // Less side margin on mobile
    
    const maxX = window.innerWidth - 220 - safeZoneSides;
    const maxY = window.innerHeight - 220 - safeZoneBottom;
    const minY = safeZoneTop;
    
    const x = Math.floor(Math.random() * maxX) + safeZoneSides;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
    
    return { x, y };
  };

  // Give each todo some movement
  const randomVelocity = () => {
    const speed = 0.4; // Adjust if too fast/slow
    const vx = (Math.random() * 2 - 1) * speed;
    const vy = (Math.random() * 2 - 1) * speed;
    return { vx, vy };
  };

  const loadTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      const movingTodos = response.data.map(todo => {
        const { x, y } = randomPosition();
        const { vx, vy } = randomVelocity();
        return { ...todo, x, y, vx, vy };
      });
      setTodos(movingTodos);
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const createTodo = async () => {
    if (!newTitle.trim()) return;
    
    try {
      const response = await axios.post(`${API_URL}/todos`, {
        title: newTitle,
        description: "",
        done: false
      });
      
      const { x, y } = randomPosition();
      const { vx, vy } = randomVelocity();
      const todoWithMovement = { ...response.data, x, y, vx, vy };
      
      setTodos(prev => [...prev, todoWithMovement]);
      setNewTitle("");
    } catch (error) {
      console.error("Couldn't create todo:", error);
    }
  };

  const removeTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const saveEdit = async () => {
    try {
      const update = { title: editText, description: "", done: false };
      const response = await axios.put(`${API_URL}/todos/${editingId}`, update);
      
      setTodos(prev =>
        prev.map(todo =>
          todo.id === editingId
            ? { ...response.data, x: todo.x, y: todo.y, vx: todo.vx, vy: todo.vy }
            : todo
        )
      );
      
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Animation loop - makes todos bounce around
  useEffect(() => {
    const bounce = () => {
      setTodos((currentTodos) => {
        const updatedTodos = currentTodos.map((todo, index) => {
          let { x, y, vx, vy } = todo;
          
          // Define safe zones (responsive)
          const isMobile = window.innerWidth <= 768;
          const safeZoneTop = isMobile ? 250 : 200;
          const safeZoneBottom = 100;
          const safeZoneSides = isMobile ? 20 : 50;
          
          const maxX = window.innerWidth - 220 - safeZoneSides;
          const maxY = window.innerHeight - 220 - safeZoneBottom;
          const minX = safeZoneSides;
          const minY = safeZoneTop;

          x += vx;
          y += vy;

          for (let i = 0; i < currentTodos.length; i++) {
            if (i !== index) {
              const other = currentTodos[i];
              const dx = x - other.x;
              const dy = y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = 160;

              if (distance < minDistance && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                const overlap = minDistance - distance;
                const separationX = (overlap / 2) * cos;
                const separationY = (overlap / 2) * sin;
                
                x += separationX;
                y += separationY;

                const bounceStrength = 0.8;
                vx = cos * bounceStrength;
                vy = sin * bounceStrength;
              }
            }
          }
          if (x <= minX || x >= maxX) {
            vx = -vx;
            x = x <= minX ? minX : maxX;
          }
          if (y <= minY || y >= maxY) {
            vy = -vy;
            y = y <= minY ? minY : maxY;
          }

          return { ...todo, x, y, vx, vy };
        });

        return updatedTodos;
      });
      
      animationRef.current = requestAnimationFrame(bounce);
    };

    animationRef.current = requestAnimationFrame(bounce);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="App">
      <AnimatedGridBackground />

      <h1 className="App-heading">
        {appTitle.split("").map((char, idx) => (
          <span
            key={idx}
            style={{
              color: titleColors[idx],
              textShadow: `0 0 8px ${titleColors[idx]}`,
              transition: 'color 0.5s, text-shadow 0.5s'
            }}
          >
            {char}
          </span>
        ))}
      </h1>

      <div className="InputContainer">
        <input
          type="text"
          placeholder="What needs doing?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="TodoInput"
          onKeyPress={(e) => e.key === 'Enter' && createTodo()}
        />
        <button onClick={createTodo} className="IconButton add">
          ➕
        </button>
      </div>

      <div className="TodoContainer">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="TodoItem"
            style={{ left: todo.x, top: todo.y }}
          >
            {editingId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="EditInput"
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                />
                <button onClick={saveEdit} className="IconButton save">
                  ✓
                </button>
                <button onClick={() => setEditingId(null)} className="IconButton cancel">
                  ✕
                </button>
              </>
            ) : (
              <>
                <div className="TodoText">{todo.title}</div>
                <button onClick={() => startEdit(todo)} className="IconButton edit">
                  ✏️
                </button>
                <button onClick={() => removeTodo(todo.id)} className="IconButton delete">
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
