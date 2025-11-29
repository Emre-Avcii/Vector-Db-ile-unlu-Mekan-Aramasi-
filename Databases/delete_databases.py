import psycopg2
from qdrant_client import QdrantClient
from pymilvus import connections, Collection

def reset_postgres():
    try:
        pg_conn = psycopg2.connect(
            host="localhost",      # Docker host
            database="mydata",
            user="admin",
            password="1234",
            port=5432              # PostgreSQL host port
        )
        pg_cursor = pg_conn.cursor()
        print("🗑 PostgreSQL → landmarks tablo sıfırlanıyor...")
        pg_cursor.execute("TRUNCATE TABLE landmarks RESTART IDENTITY;")
        pg_conn.commit()
        pg_cursor.close()
        pg_conn.close()
        print("✔ PostgreSQL temizlendi.\n")
    except Exception as e:
        print("❌ PostgreSQL reset hata:", e, "\n")


def reset_qdrant():
    try:
        print("🗑 Qdrant → landmarks koleksiyonu siliniyor...")
        # Qdrant host portu 6334
        qdrant = QdrantClient(url="http://localhost:6334")
        qdrant.delete_collection("landmarks")
        print("✔ Qdrant temizlendi.\n")
    except Exception as e:
        print("❌ Qdrant reset hata:", e, "\n")


def reset_milvus():
    try:
        print("🗑 Milvus → landmarks koleksiyonu siliniyor...")
        # Milvus Docker portu 19530
        connections.connect("default", host="localhost", port="19530")
        Collection("landmarks").drop()
        print("✔ Milvus temizlendi.\n")
    except Exception as e:
        print("❌ Milvus reset hata:", e, "\n")


def confirm():
    choice = input("⚠️ Bu işlem tüm verileri silecek. Emin misin? (e/h): ").lower()
    return choice == "e"


def menu():
    print("""
==============================
   VERİTABANI RESET MENÜSÜ
==============================
1 → PostgreSQL temizle
2 → Qdrant temizle
3 → Milvus temizle
4 → Hepsini temizle
0 → Çıkış
==============================
""")
    return input("Seçenek: ").strip()


# -----------------------------
# Ana program
# -----------------------------
while True:
    option = menu()

    if option == "1":
        if confirm():
            reset_postgres()
    elif option == "2":
        if confirm():
            reset_qdrant()
    elif option == "3":
        if confirm():
            reset_milvus()
    elif option == "4":
        if confirm():
            reset_postgres()
            reset_qdrant()
            reset_milvus()
    elif option == "0":
        print("👋 Çıkılıyor…")
        break
    else:
        print("❌ Geçersiz seçenek!\n")
