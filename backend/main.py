import pymilvus
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Famous Landmark Finder", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .database import connect_milvus, engine, Base, qdrant_client

@app.on_event("startup")
async def startup_event():
    # Connect to Milvus
    connect_milvus()
    
    # Ensure Qdrant collection exists
    # CLIP ViT-B/32 has 512 dimensions
    try:
        qdrant_client.ensure_collection(
            collection_name="landmarks", 
            vectors_config={
                "size": 512, 
                "distance": "Cosine"
            }
        )
    except Exception as e:
        print(f"Failed to initialize Qdrant collection: {e}")

    # Create tables
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Welcome to Famous Landmark Finder API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from .routers import search, benchmark, admin
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(benchmark.router, prefix="/api/v1", tags=["benchmark"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])


