// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AnimatedGridBackground from './AnimatedGridBackground';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [headingColors, setHeadingColors] = useState([]);
  
  // We'll store a ref to the animation frame, so we can cancel if needed
  const animFrameRef = useRef(null);

  const headingText = "Neon Task";

  // Predefined color palette
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

  // Returns a random color from the palette
  const getRandomPaletteColor = () => {
    return palette[Math.floor(Math.random() * palette.length)];
  };

  // Initialize headingColors
  useEffect(() => {
    const initialColors = headingText.split("").map(() => getRandomPaletteColor());
    setHeadingColors(initialColors);
  }, [headingText]);

  // Update heading colors every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingColors(headingText.split("").map(() => getRandomPaletteColor()));
    }, 500);
    return () => clearInterval(interval);
  }, [headingText]);

  // Generate random position for a todo
  const getRandomPosition = () => {
    const posX = Math.floor(Math.random() * (window.innerWidth - 220));
    const posY = Math.floor(Math.random() * (window.innerHeight - 220));
    return { posX, posY };
  };

  // Generate random velocity for a todo
  const getRandomVelocity = () => {
    // Adjust speed as desired
    const speed = 0.4; 
    const dx = (Math.random() * 2 - 1) * speed;
    const dy = (Math.random() * 2 - 1) * speed;
    return { dx, dy };
  };

  // Fetch todos and assign random position + velocity
  const fetchTodos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/todos");
      const todosWithPosVel = res.data.map(todo => {
        const { posX, posY } = getRandomPosition();
        const { dx, dy } = getRandomVelocity();
        return { ...todo, posX, posY, dx, dy };
      });
      setTodos(todosWithPosVel);
    } catch (error) {
      console.error("Error fetching todos", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add a new todo with random pos + velocity
  const addTodo = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await axios.post("http://localhost:8000/todos", {
        title: newTitle,
        description: "",
        done: false
      });
      const { posX, posY } = getRandomPosition();
      const { dx, dy } = getRandomVelocity();
      const newTodo = { ...res.data, posX, posY, dx, dy };
      setTodos(prev => [...prev, newTodo]);
      setNewTitle("");
    } catch (error) {
      console.error("Error adding todo", error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo", error);
    }
  };

  // Start editing
  const startEditing = (todo) => {
    setEditId(todo.id);
    setEditTitle(todo.title);
  };

  // Update a todo, preserving pos + velocity
  const updateTodo = async () => {
    try {
      const updatedTodo = { title: editTitle, description: "", done: false };
      const res = await axios.put(`http://localhost:8000/todos/${editId}`, updatedTodo);
      setTodos(prev =>
        prev.map(todo =>
          todo.id === editId
            ? {
                ...res.data,
                posX: todo.posX,
                posY: todo.posY,
                dx: todo.dx,
                dy: todo.dy
              }
            : todo
        )
      );
      setEditId(null);
      setEditTitle("");
    } catch (error) {
      console.error("Error updating todo", error);
    }
  };

  // Animate via requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) => {
          let { posX, posY, dx, dy } = todo;
          const maxX = window.innerWidth - 220;
          const maxY = window.innerHeight - 220;

          // Move
          posX += dx;
          posY += dy;

          // Bounce horizontally
          if (posX < 0) {
            posX = 0;
            dx = -dx;
          } else if (posX > maxX) {
            posX = maxX;
            dx = -dx;
          }

          // Bounce vertically
          if (posY < 0) {
            posY = 0;
            dy = -dy;
          } else if (posY > maxY) {
            posY = maxY;
            dy = -dy;
          }

          return { ...todo, posX, posY, dx, dy };
        })
      );
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="App">
      <AnimatedGridBackground />

      <h1 className="App-heading">
        {headingText.split("").map((char, idx) => (
          <span
            key={idx}
            style={{
              color: headingColors[idx],
              textShadow: `0 0 8px ${headingColors[idx]}`,
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
          placeholder="Enter your next brilliant todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="TodoInput"
        />
        <button onClick={addTodo} className="FancyButton">
          Add Todo
        </button>
      </div>

      <div className="TodoContainer">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="TodoItem"
            style={{
              left: todo.posX,
              top: todo.posY
            }}
          >
            {editId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="EditInput"
                />
                <button onClick={updateTodo} className="FancyButton">
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="FancyButton"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="TodoText">{todo.title}</div>
                <button
                  onClick={() => startEditing(todo)}
                  className="FancyButton"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="FancyButton"
                >
                  Delete
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
