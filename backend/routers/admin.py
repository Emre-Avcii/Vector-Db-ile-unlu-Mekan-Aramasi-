from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from ..database import get_db, qdrant_client
from ..services.clip_service import clip_service
from ..models import Landmark, LandmarkCreate
from ..config import settings
from pymilvus import Collection

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/admin/landmark")
async def add_landmark(
    name: str = Form(...),
    description: str = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Save Image
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Generate Embedding
    embedding = clip_service.get_image_embedding(file_path)
    if not embedding:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

    # 3. Save to Postgres
    # Note: In a real app, upload image to S3/Cloudinary and get URL. Here we use local path or mock URL.
    # For simplicity, we'll assume the frontend can serve from uploads/ or we return a relative path.
    image_url = f"/uploads/{file.filename}" 
    
    db_landmark = Landmark(
        name=name,
        description=description,
        image_url=image_url,
        location=f"POINT({longitude} {latitude})"
    )
    db.add(db_landmark)
    db.commit()
    db.refresh(db_landmark)

    # 4. Save to Qdrant
    qdrant_client.upsert(
        collection_name="landmarks",
        points=[
            {
                "id": db_landmark.id,
                "vector": embedding,
                "payload": {"name": name}
            }
        ]
    )

    # 5. Save to Milvus
    try:
        collection = Collection("landmarks")
        # Milvus expects list of lists for vectors
        collection.insert([
            [db_landmark.id],
            [embedding]
        ])
    except Exception as e:
        print(f"Milvus insert error: {e}")

    return {"status": "success", "id": db_landmark.id}
