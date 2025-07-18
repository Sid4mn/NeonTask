from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID, uuid4

app = FastAPI()

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Todo(BaseModel):
    id: Optional[UUID] = None
    title: str
    description: Optional[str] = ""
    done: bool = False

# Simple in-memory storage for now
todo_list: List[Todo] = []

# ===== API ENDPOINTS =====

@app.get("/todos", response_model=List[Todo])
def get_all_todos():
    return todo_list

@app.post("/todos", response_model=Todo)
def add_new_todo(todo: Todo):
    todo.id = uuid4()
    todo_list.append(todo)
    return todo

@app.get("/todos/{todo_id}", response_model=Todo)
def get_single_todo(todo_id: UUID):
    for todo in todo_list:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.put("/todos/{todo_id}", response_model=Todo)
def update_existing_todo(todo_id: UUID, updated_todo: Todo):
    for i, todo in enumerate(todo_list):
        if todo.id == todo_id:
            updated_todo.id = todo_id
            todo_list[i] = updated_todo
            return updated_todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/todos/{todo_id}")
def remove_todo(todo_id: UUID):
    for i, todo in enumerate(todo_list):
        if todo.id == todo_id:
            todo_list.pop(i)
            return {"message": "Todo deleted successfully"}
    raise HTTPException(status_code=404, detail="Todo not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
