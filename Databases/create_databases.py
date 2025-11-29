import pandas as pd
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

# PostgreSQL
import psycopg2

# Qdrant
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance, PointStruct

# Milvus
from pymilvus import connections, CollectionSchema, FieldSchema, DataType, Collection

# ------------------------------
# 1️⃣ CSV oku
# ------------------------------
# Türkçe Windows için genellikle cp1254 işe yarar




file_path = r"C:\Users\emrea\OneDrive\Desktop\LandmarkProject\Databases\landmarks.xlsx"

df = pd.read_excel(file_path)
print(df.head())







print(f"Toplam kayıt: {len(df)}")

# ------------------------------
# 2️⃣ PostgreSQL'e bağlan
# ------------------------------
pg_conn = psycopg2.connect(
    host="localhost",
    database="mydata",
    user="admin",
    password="1234"
)
pg_cursor = pg_conn.cursor()

# Tablo oluştur
pg_cursor.execute("""
CREATE TABLE IF NOT EXISTS landmarks (
    id SERIAL PRIMARY KEY,
    name TEXT,
    country TEXT,
    photo_url TEXT,
    location TEXT
);
""")
pg_conn.commit()

# ------------------------------
# 3️⃣ CSV → PostgreSQL
# ------------------------------
for _, row in df.iterrows():
    pg_cursor.execute(
        """
        INSERT INTO landmarks (id, name, country, photo_url, location) 
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING
        """,
        (row['ID'], row['İsim'], row['Ülke'], row['Fotoğrafın URLsi'], row['Konum'])
    )

pg_conn.commit()
print("PostgreSQL'e yüklendi ✅")

# ------------------------------
# 4️⃣ Embedding modeli
# ------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = []
for desc in tqdm(df['İsim'], desc="Embedding oluşturuluyor"):
    emb = model.encode(desc).tolist()
    embeddings.append(emb)

df['embedding'] = embeddings

# ------------------------------
# 5️⃣ Qdrant'a yükle
# ------------------------------
qdrant_client = QdrantClient("http://localhost:6333")

qdrant_client.recreate_collection(
    collection_name="landmarks",
    vectors_config=VectorParams(size=len(embeddings[0]), distance=Distance.COSINE)
)

points = []
for _, row in df.iterrows():
    points.append(PointStruct(
        id=int(row['ID']),
        vector=row['embedding'],
        payload={
            'name': row['İsim'],
            'country': row['Ülke'],
            'photo_url': row['Fotoğrafın URLsi'],
            'location': row['Konum']
        }
    ))

qdrant_client.upsert(collection_name="landmarks", points=points)
print("Qdrant'a yüklendi ✅")

# ------------------------------
# 6️⃣ Milvus'a yükle
# ------------------------------
connections.connect("default", host="localhost", port="19530")

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=len(embeddings[0])),
]

schema = CollectionSchema(fields, description="Landmarks collection")
milvus_collection = Collection("landmarks", schema)

milvus_collection.insert([df['ID'].tolist(), df['embedding'].tolist()])
print("Milvus'a yüklendi ✅")

# ------------------------------
# 7️⃣ PostgreSQL bağlantısını kapat
# ------------------------------
pg_cursor.close()
pg_conn.close()
