from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid

# --- Pydantic Models ---
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, example="My Item")
    description: Optional[str] = Field(None, example="A cool description of my item")
    price: float = Field(..., gt=0, example=19.99)

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, example="Updated Item Name")
    description: Optional[str] = Field(None, example="An updated description")
    price: Optional[float] = Field(None, gt=0, example=29.99)

class Item(ItemBase):
    id: str = Field(..., example="d290f1ee-6c54-4b01-90e6-d701748f0851")

# --- In-Memory Storage ---
# Using a dictionary to store items, with the item ID as the key.
# This is for simplicity; a real application would use a database.
fake_items_db: Dict[str, Item] = {}

# --- FastAPI Application ---
app = FastAPI(
    title="Simple CRUD API",
    description="A basic API for managing items, for Locust testing.",
    version="1.0.0"
)

# --- Helper Function ---
def generate_id() -> str:
    """Generates a unique string ID."""
    return str(uuid.uuid4())

# --- CRUD Endpoints ---

@app.post("/items/", response_model=Item, status_code=status.HTTP_201_CREATED, tags=["Items"])
async def create_item(item_in: ItemCreate):
    """
    Create a new item.
    """
    item_id = generate_id()
    new_item = Item(id=item_id, **item_in.model_dump())
    fake_items_db[item_id] = new_item
    return new_item

@app.get("/items/", response_model=List[Item], tags=["Items"])
async def read_items(skip: int = 0, limit: int = 100):
    """
    Retrieve all items with pagination.
    """
    items_list = list(fake_items_db.values())
    return items_list[skip : skip + limit]

@app.get("/items/{item_id}", response_model=Item, tags=["Items"])
async def read_item(item_id: str):
    """
    Retrieve a specific item by its ID.
    """
    item = fake_items_db.get(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item

@app.put("/items/{item_id}", response_model=Item, tags=["Items"])
async def update_item(item_id: str, item_in: ItemUpdate):
    """
    Update an existing item.
    """
    existing_item = fake_items_db.get(item_id)
    if not existing_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_data = item_in.model_dump(exclude_unset=True) # Get only fields that were actually provided
    
    # Create a new Item object with updated fields
    # Pydantic models are immutable by default, so we create a new one
    updated_item_data = existing_item.model_copy(update=update_data).model_dump()
    updated_item = Item(**updated_item_data)

    fake_items_db[item_id] = updated_item
    return updated_item

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Items"])
async def delete_item(item_id: str):
    """
    Delete an item by its ID.
    """
    if item_id not in fake_items_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    del fake_items_db[item_id]
    return # FastAPI will return 204 No Content automatically

# --- Root Endpoint (Optional) ---
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Simple CRUD API for Locust Testing!"}

# --- To run this FastAPI app (save as main.py or similar): ---
# 1. Install FastAPI and Uvicorn:
#    pip install fastapi "uvicorn[standard]" pydantic
#
# 2. Run with Uvicorn:
#    uvicorn main:app --reload
#
#    The API will be available at http://127.0.0.1:8000
#    Interactive docs (Swagger UI) at http://127.0.0.1:8000/docs
#    Alternative docs (ReDoc) at http://127.0.0.1:8000/redoc