# NeonTask 

A fun todo app with bouncing animations! This was my experiment learning React, FastAPI, and Docker. The todos literally bounce around the screen with physics - because why not? 😄

## What I Built

- **Frontend**: React app with custom physics engine for bouncing todos
- **Backend**: FastAPI server with simple CRUD operations
- **Deployment**: Docker setup that actually works!
- **Physics**: Real collision detection (took forever to get right)

## Cool Features

- Todos bounce around and collide with each other
- Mobile responsive with different animations
- Icon-based UI (learned about UX design)
- Safe zones so todos don't overlap the input area
- Neon theme because it looks awesome

## Tech Stack I Learned

**Frontend:**
- React 18 with hooks (useState, useEffect)
- Custom physics with requestAnimationFrame 
- CSS animations and responsive design
- Axios for API calls

**Backend:**
- FastAPI (way easier than Django!)
- Pydantic for data validation
- CORS setup for frontend integration
- UUID generation for unique IDs

**DevOps Stuff:**
- Docker containers (finally figured them out)
- Docker Compose for multi-service setup
- nginx for serving React in production

## How to Run This

### Easy Way (Docker)
```bash
git clone <your-repo>
cd NeonTask
docker-compose up --build
```
Then go to `http://localhost` - the frontend and backend just work!

### Development Mode
If you want to play around with the code:
```bash
# Backend (Terminal 1)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Frontend (Terminal 2) 
cd frontend/todo-app
npm install
npm start
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8001`

## API I Built

Simple CRUD operations (Create, Read, Update, Delete):

GET = `/todos` -  Get all todos
POST = `/todos` -  Create new todo
PUT = `/todos/{id}` - Update a todo
DELETE = `/todos/{id}` - Delete a todo

The data structure:
```javascript
{
  id: "uuid-string",
  title: "Todo text", 
  description: "Optional details",
  done: false
}
```

FastAPI automatically generates API docs at `http://localhost:8001/docs` - super helpful!
