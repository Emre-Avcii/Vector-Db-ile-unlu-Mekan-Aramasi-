from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from ..database import get_db
from ..services.clip_service import clip_service
from ..services.search_service import search_service
from ..models import SearchResponse

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/search/image", response_model=List[SearchResponse])
async def search_by_image(
    file: UploadFile = File(...),
    limit: int = Form(5),
    distance_km: float = Form(10.0),
    user_lat: float = Form(...),
    user_lon: float = Form(...),
    db: Session = Depends(get_db)
):
    # Save temp file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get embedding
    embedding = clip_service.get_image_embedding(file_path)
    
    # Cleanup
    os.remove(file_path)

    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

    # Search in Qdrant (Primary for now)
    # Benchmark: We could search both and compare
    q_results, q_latency = search_service.search_qdrant(embedding, limit=limit*2) # Fetch more to filter by distance
    
    # Extract IDs
    landmark_ids = [hit.id for hit in q_results]
    
    # Get details and filter by distance
    details = search_service.get_landmark_details(db, landmark_ids, user_lat, user_lon)
    
    # Format response
    response = []
    for item in details:
        if item["distance_km"] <= distance_km:
            l = item["landmark"]
            # Find score from q_results
            score = next((hit.score for hit in q_results if hit.id == l.id), 0)
            
            response.append(SearchResponse(
                id=l.id,
                name=l.name,
                image_url=l.image_url,
                similarity_score=score,
                distance_km=item["distance_km"],
                latitude=db.scalar(l.location.ST_Y()),
                longitude=db.scalar(l.location.ST_X())
            ))
            
    return response[:limit]

@router.post("/search/text", response_model=List[SearchResponse])
async def search_by_text(
    query: str = Form(...),
    limit: int = Form(5),
    user_lat: float = Form(...),
    user_lon: float = Form(...),
    db: Session = Depends(get_db)
):
    embedding = clip_service.get_text_embedding(query)
    if not embedding:
         raise HTTPException(status_code=500, detail="Failed to generate embedding")
         
    q_results, q_latency = search_service.search_qdrant(embedding, limit=limit)
    
    landmark_ids = [hit.id for hit in q_results]
    details = search_service.get_landmark_details(db, landmark_ids, user_lat, user_lon)
    
    response = []
    for item in details:
        l = item["landmark"]
        score = next((hit.score for hit in q_results if hit.id == l.id), 0)
        response.append(SearchResponse(
            id=l.id,
            name=l.name,
            image_url=l.image_url,
            similarity_score=score,
            distance_km=item["distance_km"],
            latitude=db.scalar(l.location.ST_Y()),
            longitude=db.scalar(l.location.ST_X())
        ))
        
    return response
