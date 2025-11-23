import time
from typing import List, Dict
from pymilvus import Collection
from sqlalchemy.orm import Session
from geoalchemy2.functions import ST_DistanceSphere, ST_MakePoint
from ..database import qdrant_client
from ..models import Landmark, SearchResponse
from ..config import settings

class SearchService:
    def __init__(self):
        pass

    def search_qdrant(self, vector: List[float], limit: int = 5):
        start_time = time.time()
        results = qdrant_client.search(
            collection_name="landmarks",
            query_vector=vector,
            limit=limit
        )
        latency = (time.time() - start_time) * 1000 # ms
        return results, latency

    def search_milvus(self, vector: List[float], limit: int = 5):
        start_time = time.time()
        # Assuming collection is loaded
        collection = Collection("landmarks")
        search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}
        results = collection.search(
            data=[vector], 
            anns_field="embedding", 
            param=search_params, 
            limit=limit,
            output_fields=["id"]
        )
        latency = (time.time() - start_time) * 1000 # ms
        return results[0], latency

    def get_landmark_details(self, db: Session, landmark_ids: List[int], user_lat: float, user_lon: float):
        # Fetch details from Postgres
        # Also calculate distance
        user_point = ST_MakePoint(user_lon, user_lat)
        
        query = db.query(
            Landmark, 
            ST_DistanceSphere(Landmark.location, user_point).label("distance")
        ).filter(Landmark.id.in_(landmark_ids))
        
        results = []
        for landmark, distance in query.all():
            # Convert meters to km
            dist_km = distance / 1000.0
            results.append({
                "landmark": landmark,
                "distance_km": dist_km
            })
        return results

search_service = SearchService()
