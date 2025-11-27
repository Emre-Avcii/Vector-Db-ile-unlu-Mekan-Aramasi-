let map;
let markers = [];
let popup;

// 1. Harita Başlatma (Leaflet)
window.onload = function () {
    initMap();
};

function initMap() {
    console.log("Leaflet Haritası başlatılıyor...");

    // Varsayılan Merkez (Eskişehir Osmangazi Üni civarı örnek olarak)
    const initialLocation = [39.7505, 30.4858];

    // Haritayı oluştur
    map = L.map('map').setView(initialLocation, 12);

    // OpenStreetMap katmanını ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    popup = L.popup();

    // IR-05: Harita üzerinde tıklanan noktaya göre yakın mekanları getirme
    map.on('click', onMapClick);

    // Yükleme ekranını gizle
    const mapLoadingElement = document.querySelector('.vd-map-loading');
    if (mapLoadingElement) mapLoadingElement.style.display = 'none';
}

function onMapClick(e) {
    const clickedLocation = e.latlng;
    console.log("Haritaya tıklandı:", clickedLocation);

    // Tıklanan yere geçici marker koy
    addMarker(clickedLocation.lat, clickedLocation.lng, "Seçilen Konum", true);

    // Arama fonksiyonunu "Konum Bazlı" olarak tetikle
    performGeoSearch(clickedLocation.lat, clickedLocation.lng);
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// 2. Arama Mantığı (Buton ve Görsel ile)
function performSearch() {
    const searchTerm = document.getElementById('search-bar').value.trim();
    const imageInput = document.getElementById('image-upload');
    const isImageSelected = imageInput.files.length > 0;

    hideError();

    // FR-15 / IR-06: Boş sorgu kontrolü
    if (!searchTerm && !isImageSelected) {
        showError("Lütfen bir mekan ismi girin veya bir görsel yükleyin.");
        return;
    }

    // FR-1: Dosya türü kontrolü 
    if (isImageSelected) {
        const file = imageInput.files[0];
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError("Hata: Sadece JPEG ve PNG formatları desteklenmektedir. (FR-1)");
            return;
        }
    }

    uisetLoading(true);

    // --- Simülasyon ---
    setTimeout(() => {
        // Mock veri getir
        const results = getMockResults();
        displayResults(results);
        uisetLoading(false);
    }, 1500);
}

// IR-05 İçin Özel Coğrafi Arama Fonksiyonu
function performGeoSearch(lat, lng) {
    uisetLoading(true);
    document.getElementById('search-bar').value = `Konum: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    setTimeout(() => {
        // Normalde burada backend'e lat/lng gönderilir ve PostGIS <-> Vector DB sorgusu yapılır.
        // Simülasyon için yine mock veri dönüyoruz ama "Konum Araması" olduğunu varsayıyoruz.
        const results = getMockResults();
        displayResults(results);
        uisetLoading(false);

        // Haritayı tıklanan yere odakla
        map.panTo([lat, lng]);
    }, 1000);
}

// 3. UI Yardımcıları
function uisetLoading(isLoading) {
    const btn = document.querySelector('.vd-button--primary');
    if (isLoading) {
        btn.innerHTML = '<span class="vd-icon vd-icon--search"></span> İşleniyor...';
        btn.disabled = true;
    } else {
        btn.innerHTML = '<span class="vd-icon vd-icon--start-search"></span> Aramayı Başlat';
        btn.disabled = false;
    }
}

// Görsel dosya ismi gösterme
document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('image-upload');
    const lbl = document.getElementById('file-name-display');
    if (inp && lbl) {
        inp.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                lbl.textContent = e.target.files[0].name;
                lbl.classList.add('is-selected');
            } else {
                lbl.textContent = 'Görsel Seçilmedi';
                lbl.classList.remove('is-selected');
            }
        });
    }
});

// 4. Sonuçları Görüntüleme (FR-8, DR-01, FR-9)
function displayResults(results) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    clearMarkers();

    if (results.length === 0) {
        // FR-17, FR-18: Bulunamadı mesajı
        container.innerHTML = '<p class="vd-no-results">Belirtilen kriterlere uygun ünlü mekan bulunamadı.</p>';
        return;
    }

    // FR-9: Sonuçlar mesafeye göre sıralanmalı (Mock veri zaten sıralı geliyor varsayalım veya burada sıralayalım)
    results.sort((a, b) => a.distance - b.distance);

    results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'vd-result-item';

        // FR-8: Görsel, Ad, Skor, Mesafe gösterilmeli
        // DR-01: Ülke gösterilmeli
        item.innerHTML = `
            <img src="${res.photoUrl}" alt="${res.name}" class="vd-result-img">
            <div class="vd-result-content">
                <h4 class="vd-result-item__title">
                    ${res.name} 
                    <span class="vd-badge-country">${res.country}</span>
                </h4>
                <p class="vd-result-item__detail"><span class="vd-icon vd-icon--map-marker"></span> <strong>Uzaklık:</strong> ${res.distance} km</p>
                <p class="vd-result-item__detail"><span class="vd-icon vd-icon--list"></span> <strong>Benzerlik:</strong> %${(res.score * 100).toFixed(1)}</p>
                <p class="vd-result-item__detail" style="font-size:0.85em; color:#777;">${res.description}</p>
            </div>
        `;

        // Tıklanınca haritada o noktaya git
        item.addEventListener('click', () => {
            map.setView([res.lat, res.lng], 16);
            // Marker'ın popup'ını aç
            markers.forEach(m => {
                if (m.getLatLng().lat === res.lat && m.getLatLng().lng === res.lng) {
                    m.openPopup();
                }
            });
        });

        container.appendChild(item);
        addMarker(res.lat, res.lng, res.name);
    });
}

function addMarker(lat, lng, title, isUserSelection = false) {
    // Leaflet'te ikon rengini değiştirmek biraz daha farklıdır, varsayılan mavi ikon kullanılır.
    // İsteğe bağlı olarak özel ikon tanımlanabilir ama şimdilik varsayılanı kullanıyoruz.
    // Kullanıcı seçimi için farklı bir şey yapmak istersek CSS filter kullanabiliriz veya özel ikon.

    const marker = L.marker([lat, lng]).addTo(map);

    if (isUserSelection) {
        // Basitçe popup içeriğini farklı yapalım
        marker.bindPopup(`<b>${title}</b><br>Seçilen Konum`).openPopup();
    } else {
        marker.bindPopup(`<b>${title}</b>`);
    }

    markers.push(marker);
}

// 5. Hata Yönetimi
function showError(msg) {
    const err = document.getElementById('error-message');
    err.innerHTML = `<span class="vd-icon vd-icon--alert"></span> ${msg}`;
    err.classList.remove('vd-alert--hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('vd-alert--hidden');
}

// 6. SAHTE VERİ (DR-01 Yapısına Uygun)
function getMockResults() {
    // Doküman: ID, Fotoğraf URL, Konum, İsim, Ülke
    const count = parseInt(document.getElementById('result-count').value);

    const allData = [
        {
            id: 1,
            name: "Sazova Parkı (Masal Şatosu)",
            country: "Türkiye",
            description: "Eskişehir'in sembollerinden, Disneyland benzeri yapı.",
            photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Sazova_Park%C4%B1_Masal_%C5%9Eatosu.jpg/300px-Sazova_Park%C4%B1_Masal_%C5%9Eatosu.jpg",
            score: 0.98,
            distance: 2.5,
            lat: 39.7665,
            lng: 30.4735
        },
        {
            id: 2,
            name: "Odunpazarı Evleri",
            country: "Türkiye",
            description: "Osmanlı dönemi sivil mimari örnekleri.",
            photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Odunpazari_houses.jpg/300px-Odunpazari_houses.jpg",
            score: 0.95,
            distance: 4.1,
            lat: 39.7601,
            lng: 30.5236
        },
        {
            id: 3,
            name: "Porsuk Çayı & Adalar",
            country: "Türkiye",
            description: "Şehrin içinden geçen çay ve eğlence bölgesi.",
            photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Porsuk_River_in_Eski%C5%9Fehir.jpg/300px-Porsuk_River_in_Eski%C5%9Fehir.jpg",
            score: 0.89,
            distance: 5.0,
            lat: 39.7733,
            lng: 30.5186
        },
        {
            id: 4,
            name: "Galata Kulesi", // Mesafesi yüksek örnek
            country: "Türkiye",
            description: "İstanbul'un tarihi gözetleme kulesi.",
            photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Galata_Tower_in_Istanbul.jpg/200px-Galata_Tower_in_Istanbul.jpg",
            score: 0.65,
            distance: 250.0,
            lat: 41.0256,
            lng: 28.9744
        },
        {
            id: 5,
            name: "Kolezyum",
            country: "İtalya",
            description: "Roma'daki antik amfitiyatro.",
            photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/300px-Colosseo_2020.jpg",
            score: 0.45,
            distance: 1500.0,
            lat: 41.8902,
            lng: 12.4922
        }
    ];

    // Simülasyon: Mesafe filtresi uygula (FR-6)
    const maxDist = parseInt(document.getElementById('distance-range').value);

    // Verileri filtrele ve kullanıcı isteği kadar (FR-13) kes
    return allData
        .filter(d => d.distance <= maxDist)
        .slice(0, count);
}