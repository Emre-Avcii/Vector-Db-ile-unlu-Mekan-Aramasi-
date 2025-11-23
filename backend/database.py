from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import requests
from pymilvus import connections
from .config import settings

# PostgreSQL Setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Qdrant REST Wrapper (to avoid protobuf conflicts)
class QdrantRestWrapper:
    def __init__(self, host, port):
        self.base_url = f"http://{host}:{port}"
    
    def search(self, collection_name, query_vector, limit=5):
        url = f"{self.base_url}/collections/{collection_name}/points/search"
        payload = {
            "vector": query_vector,
            "limit": limit,
            "with_payload": True
        }
        response = requests.post(url, json=payload)
        response.raise_for_status()
        # Convert to object-like structure for compatibility
        results = []
        for item in response.json().get("result", []):
            results.append(type('ScoredPoint', (object,), item))
        return results

    def upsert(self, collection_name, points):
        url = f"{self.base_url}/collections/{collection_name}/points"
        # points is expected to be a list of dicts or objects with id, vector, payload
        points_data = []
        for p in points:
            if hasattr(p, 'id'): # Handle object-like (if we kept PointStruct usage elsewhere, but we will remove it)
                points_data.append({
                    "id": p.id,
                    "vector": p.vector,
                    "payload": p.payload
                })
            else:
                points_data.append(p)
                
        payload = {"points": points_data}
        response = requests.put(url, json=payload)
        response.raise_for_status()
        return response.json()

    def recreate_collection(self, collection_name, vectors_config):
        url = f"{self.base_url}/collections/{collection_name}"
        requests.delete(url) # Delete if exists
        payload = {"vectors": vectors_config}
        response = requests.put(url, json=payload)
        response.raise_for_status()

    def ensure_collection(self, collection_name, vectors_config):
        url = f"{self.base_url}/collections/{collection_name}"
        response = requests.get(url)
        if response.status_code == 404:
            print(f"Collection '{collection_name}' not found. Creating...")
            payload = {"vectors": vectors_config}
            response = requests.put(url, json=payload)
            response.raise_for_status()
            print(f"Collection '{collection_name}' created.")
        else:
            print(f"Collection '{collection_name}' already exists.")

# Qdrant Setup
qdrant_client = QdrantRestWrapper(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

# Milvus Setup
def connect_milvus():
    try:
        connections.connect(
            alias="default", 
            host=settings.MILVUS_HOST, 
            port=settings.MILVUS_PORT
        )
        print("Connected to Milvus")
    except Exception as e:
        print(f"Failed to connect to Milvus: {e}")
