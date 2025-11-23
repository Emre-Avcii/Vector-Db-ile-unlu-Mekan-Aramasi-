export interface Landmark {
    id: number;
    name: string;
    image_url: string;
    similarity_score: number;
    distance_km: number;
    latitude: number;
    longitude: number;
    description?: string;
}

export interface BenchmarkResult {
    qdrant: {
        latency_ms: number;
        status: string;
    };
    milvus: {
        latency_ms: number;
        status: string;
    };
}
