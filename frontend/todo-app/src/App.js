import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnimatedGridBackground from './AnimatedGridBackground';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [headingColors, setHeadingColors] = useState([]);
  
  const headingText = "Todo List";

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

  useEffect(() => {
    const initialColors = headingText.split("").map(() => getRandomPaletteColor());
    setHeadingColors(initialColors);
  }, [headingText]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingColors(headingText.split("").map(() => getRandomPaletteColor()));
    }, 500);
    return () => clearInterval(interval);
  }, [headingText]);

  const getRandomPosition = () => {
    const posX = Math.floor(Math.random() * (window.innerWidth - 220));
    const posY = Math.floor(Math.random() * (window.innerHeight - 220));
    return { posX, posY };
  };

  const fetchTodos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/todos");
      const todosWithPos = res.data.map(todo => {
        const { posX, posY } = getRandomPosition();
        return { ...todo, posX, posY };
      });
      setTodos(todosWithPos);
    } catch (error) {
      console.error("Error fetching todos", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await axios.post("http://localhost:8000/todos", { title: newTitle, description: "", done: false });
      const { posX, posY } = getRandomPosition();
      const newTodo = { ...res.data, posX, posY };
      setTodos([...todos, newTodo]);
      setNewTitle("");
    } catch (error) {
      console.error("Error adding todo", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo", error);
    }
  };

  const startEditing = (todo) => {
    setEditId(todo.id);
    setEditTitle(todo.title);
  };

  const updateTodo = async () => {
    try {
      const updatedTodo = { title: editTitle, description: "", done: false };
      const res = await axios.put(`http://localhost:8000/todos/${editId}`, updatedTodo);
      setTodos(todos.map(todo => 
        todo.id === editId ? { ...res.data, posX: todo.posX, posY: todo.posY } : todo
      ));
      setEditId(null);
      setEditTitle("");
    } catch (error) {
      console.error("Error updating todo", error);
    }
  };

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
        {todos.map(todo => (
          <div key={todo.id} className="TodoItem" style={{ left: todo.posX, top: todo.posY }}>
            {editId === todo.id ? (
              <>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="EditInput"
                />
                <button onClick={updateTodo} className="FancyButton">Save</button>
                <button onClick={() => setEditId(null)} className="FancyButton">Cancel</button>
              </>
            ) : (
              <>
                <div className="TodoText">{todo.title}</div>
                <button onClick={() => startEditing(todo)} className="FancyButton">Edit</button>
                <button onClick={() => deleteTodo(todo.id)} className="FancyButton">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
