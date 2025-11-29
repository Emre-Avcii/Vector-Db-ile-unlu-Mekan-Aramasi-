import psycopg2

# PostgreSQL bağlantısı
conn = psycopg2.connect(
    host="localhost",
    database="mydata",
    user="admin",
    password="1234"
)
cursor = conn.cursor()

# Tablonun satırlarını çek
cursor.execute("SELECT * FROM landmarks LIMIT 100;")

rows = cursor.fetchall()  # tüm satırlar

# Satırları yazdır
for row in rows:
    print(row)

# Bağlantıyı kapat
cursor.close()
conn.close()
