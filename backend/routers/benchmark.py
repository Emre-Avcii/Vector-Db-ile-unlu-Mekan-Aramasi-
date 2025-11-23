from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from ..services.clip_service import clip_service
from ..services.search_service import search_service

router = APIRouter()

@router.get("/benchmark", response_model=Dict[str, Dict[str, float]])
async def benchmark_databases(query: str = "test query"):
    # Generate embedding
    embedding = clip_service.get_text_embedding(query)
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

    # Benchmark Qdrant
    _, q_latency = search_service.search_qdrant(embedding)
    
    # Benchmark Milvus
    try:
        _, m_latency = search_service.search_milvus(embedding)
    except Exception as e:
        print(f"Milvus error: {e}")
        m_latency = -1.0

    return {
        "qdrant": {
            "latency_ms": q_latency,
            "status": "ok"
        },
        "milvus": {
            "latency_ms": m_latency,
            "status": "ok" if m_latency >= 0 else "error"
        }
    }
