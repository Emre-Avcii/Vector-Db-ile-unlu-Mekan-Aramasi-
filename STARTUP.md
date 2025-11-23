# Nasıl Çalıştırılır (How to Run)

Uygulamayı çalıştırmak için aşağıdaki adımları sırasıyla uygulayın. Her bir adım için ayrı bir terminal penceresi kullanmanız önerilir.

## 1. Veritabanı Servislerini Başlatın (Docker)
Öncelikle veritabanlarını (PostgreSQL, Qdrant, Milvus) ayağa kaldırmanız gerekir.

```powershell
# Ana dizinde (outer-shuttle klasöründe) çalıştırın:
docker-compose up -d
```

## 2. Backend Sunucusunu Başlatın (FastAPI)
Backend servisini başlatmak için:

```powershell
# Yeni bir terminal açın ve backend klasörüne gidin:
cd backend

# Sanal ortamınız varsa aktif edin (opsiyonel ama önerilir):
# .\venv\Scripts\activate

# Sunucuyu başlatın:
uvicorn main:app --reload
```
*Backend şu adreste çalışacak: http://localhost:8000*

## 3. Frontend Uygulamasını Başlatın (React)
Arayüzü başlatmak için:

```powershell
# Yeni bir terminal açın ve frontend klasörüne gidin:
cd frontend

# Geliştirme sunucusunu başlatın:
npm run dev
```
*Frontend şu adreste çalışacak: http://localhost:5173*

## Uygulamayı Durdurma
Tüm servisleri durdurmak için:
1. Frontend ve Backend terminallerinde `Ctrl + C` tuşlarına basarak sunucuları durdurun.
2. Docker servislerini durdurmak için ana dizinde şu komutu çalıştırın:
```powershell
docker-compose down
```
