let map;
let markers = [];
let popup;
let selectedLocation = null; // Seçilen yerin koordinatlarını ve adını tutar

// HTML elementlerini global olarak tanımla
const imageUpload = document.getElementById('image-upload');
const fileNameDisplay = document.getElementById('file-name-display');
let imagePreviewContainer;
let imagePreview;

// =================================================================
// 0. MOCK VERİLER (İki Fazlı Test Amaçlı)
// =================================================================

// Faz 1: Görsel aramadan dönen benzer mekanlar
const mockDataPhase1 = [
    {
        id: 1,
        name: "Sazova Masal Şatosu",
        country: "Türkiye",
        description: "Eskişehir'in sembollerinden, Disneyland benzeri yapı.",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Sazova_Park%C4%B1_Masal_%C5%9Eatosu.jpg/300px-Sazova_Park%C4%B1_Masal_%C5%9Eatosu.jpg",
        score: 0.98,
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
        lat: 39.7601,
        lng: 30.5236
    },
    {
        id: 3,
        name: "Galata Kulesi",
        country: "Türkiye",
        description: "İstanbul'un tarihi gözetleme kulesi.",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Galata_Tower_in_Istanbul.jpg/200px-Galata_Tower_in_Istanbul.jpg",
        score: 0.88,
        lat: 41.0256,
        lng: 28.9744
    }
];

// Faz 2: Seçilen bir konumun çevresindeki yakın mekanlar
const mockDataPhase2 = [
    { name: "Sazova Parkı Merkezi", country: "Türkiye", photoUrl: "https://i.ibb.co/L5rK5Qx/sazova.jpg", distance: 0.5, lat: 39.7660, lng: 30.4730 },
    { name: "Bilim Deney Merkezi", country: "Türkiye", photoUrl: "https://i.ibb.co/K2sY2T0/bilim.jpg", distance: 1.2, lat: 39.7700, lng: 30.4800 },
    { name: "Eskişehir Hayvanat Bahçesi", country: "Türkiye", photoUrl: "https://i.ibb.co/3s6S3fD/hayvanat.jpg", distance: 1.8, lat: 39.7605, lng: 30.4650 },
    { name: "Yediler Parkı", country: "Türkiye", photoUrl: "https://i.ibb.co/jL2dY5x/yediler.jpg", distance: 5.5, lat: 39.7800, lng: 30.5000 },
    { name: "Anadolu Üniversitesi Kampüsü", country: "Türkiye", photoUrl: "https://i.ibb.co/h7h1Rz8/anadolu.jpg", distance: 7.0, lat: 39.7760, lng: 30.4900 },
];


// =================================================================
// 1. HARİTA İŞLEVLERİ 
// =================================================================
window.onload = function () {
    initMap();
};

function initMap() {
    console.log("Leaflet Haritası başlatılıyor...");
    const initialLocation = [39.7505, 30.4858];
    map = L.map('map').setView(initialLocation, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    popup = L.popup();
    map.on('click', onMapClick);

    const mapLoadingElement = document.querySelector('.vd-map-loading');
    if (mapLoadingElement) mapLoadingElement.style.display = 'none';
}

function onMapClick(e) {
    const clickedLocation = e.latlng;
    console.log("Haritaya tıklandı:", clickedLocation);

    addMarker(clickedLocation.lat, clickedLocation.lng, "Seçilen Konum", true);
    performGeoSearch(clickedLocation.lat, clickedLocation.lng);
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function addMarker(lat, lng, title, isUserSelection = false) {
    const marker = L.marker([lat, lng]).addTo(map);

    
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    let popupContent = `<b>${title}</b>`;
    
    if (isUserSelection) {
        popupContent += `<br>Seçilen Konum`;
    }
    
    popupContent += `<br><a href="${googleMapsUrl}" target="_blank" 
                       style="color: var(--primary-hover); font-weight: 600; text-decoration: none;">
                       Google'da Ara 🌐
                    </a>`;

    marker.bindPopup(popupContent);
    if (isUserSelection) {
        marker.openPopup();
    }

    markers.push(marker);
}


// =================================================================
// 2. ARAMA VE İŞ MANTIĞI 
// =================================================================

function performSearch() {
    const imageInput = document.getElementById('image-upload');
    const isImageSelected = imageInput.files.length > 0;
    const searchTerm = document.getElementById('search-bar').value.trim();

    hideError();

    if (!searchTerm && !isImageSelected) {
        showError("Lütfen bir mekan ismi girin veya bir görsel yükleyin.");
        return;
    }

    if (isImageSelected) {
        const file = imageInput.files[0];
        const validTypes = ['image/jpeg', 'image/png'];
        const maxFileSize = 5 * 1024 * 1024;
        
        if (!validTypes.includes(file.type) || file.size > maxFileSize) {
            showError("Hata: Dosya tipi/boyutu uygun değil. (Max 5MB, JPEG/PNG)");
            return;
        }
        
        uisetLoading(true, "Benzer Görseller Aranıyor...");
        clearResultsArea();

        setTimeout(() => {
            const results = mockDataPhase1;
            displayPhase1Results(results);
            uisetLoading(false);
        }, 2000);

    } else if (searchTerm) {
        showError("Sadece metin aramaları şu an desteklenmiyor. Lütfen aramak istediğiniz mekana benzer bir görsel yükleyin.");
        return;
    }
}

function selectResultAndSearchNeighbors(lat, lng, name) {
    selectedLocation = { lat, lng, name };
    const maxDistance = parseInt(document.getElementById('distance-range').value);

    uisetLoading(true, `"${name}" çevresindeki ${maxDistance} km yarıçaptaki mekanlar aranıyor...`);
    
    clearMarkers();
    addMarker(lat, lng, name, true); 
    map.setView([lat, lng], 14); 

    setTimeout(() => {
        const results = mockDataPhase2.filter(d => d.distance <= maxDistance);
        
        displayPhase2Results(results, name);
        uisetLoading(false);

    }, 1500);
}

function performGeoSearch(lat, lng) {
    selectResultAndSearchNeighbors(lat, lng, "Tıklanan Konum");
}


// =================================================================
// 3. UI YARDIMCILARI VE GÖSTERİM FONKSİYONLARI
// =================================================================

function clearResultsArea() {
    document.getElementById('search-results').innerHTML = '';
}

function uisetLoading(isLoading, msg = "İşleniyor...") {
    const btn = document.querySelector('.vd-button--primary');
    if (isLoading) {
        btn.innerHTML = `<span class="vd-icon vd-icon--search"></span> ${msg}`;
        btn.disabled = true;
    } else {
        btn.innerHTML = '<span class="vd-icon vd-icon--start-search"></span> Aramayı Başlat';
        btn.disabled = false;
    }
}

// Görsel önizleme ve dosya ismi gösterme mantığı 
document.addEventListener('DOMContentLoaded', () => {
    imagePreviewContainer = document.getElementById('image-preview-container');
    imagePreview = document.getElementById('image-preview');
    
    const inp = document.getElementById('image-upload');
    const lbl = document.getElementById('file-name-display');

    if (inp && lbl) {
        inp.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (file) {
                lbl.textContent = file.name;
                lbl.classList.add('is-selected');

                const reader = new FileReader();
                reader.onload = function(evt) {
                    imagePreview.src = evt.target.result;
                    if(imagePreviewContainer) imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file); 
            } else {
                lbl.textContent = 'Görsel Seçilmedi';
                lbl.classList.remove('is-selected');
                
                if(imagePreview) imagePreview.src = '#';
                if(imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            }
        });
    }
});


// Faz 1 Sonuçlarını Görüntüleme (Benzer Mekanlar)
function displayPhase1Results(results) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    clearMarkers();
    
    // Başlık Güncellemesi
    document.querySelector('.vd-panel--results .vd-panel__subtitle').textContent = 'Bulunan Benzer Mekanlar (Lütfen Birini Seçin)';

    if (results.length === 0) {
        container.innerHTML = '<p class="vd-no-results">Yüklediğiniz görsele benzer mekan bulunamadı.</p>';
        return;
    }

    results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'vd-result-item';
        
        item.style.borderLeftColor = 'var(--primary-color)'; 

        item.innerHTML = `
            <img src="${res.photoUrl}" alt="${res.name}" class="vd-result-img">
            <div class="vd-result-content">
                <h4 class="vd-result-item__title">
                    ${res.name} 
                    <span class="vd-badge-country">${res.country}</span>
                </h4>
                <p class="vd-result-item__detail"><span class="vd-icon vd-icon--database"></span> <strong>Benzerlik:</strong> %${(res.score * 100).toFixed(1)}</p>
                <p class="vd-result-item__detail" style="font-size:0.85em; color:#777;">${res.description}</p>
                <p class="vd-result-item__detail" style="font-weight: bold; color: var(--primary-color); margin-top: 10px;">
                    Seç ve Çevresini Ara
                </p>
            </div>
        `;

        item.addEventListener('click', function() {
            document.querySelectorAll('.vd-result-item').forEach(el => {
                el.classList.remove('is-selected');
            });
            
            this.classList.add('is-selected');
            
            selectResultAndSearchNeighbors(res.lat, res.lng, res.name);
        });

        container.appendChild(item);
    });
}

// Faz 2 Sonuçlarını Görüntüleme (Seçilen Mekanın Komşuları)
function displayPhase2Results(results, selectedName) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    // 1. BAŞLIK GÜNCELLEMESİ 
    document.querySelector('.vd-panel--results .vd-panel__subtitle').textContent = `Seçilen Mekan: "${selectedName}" Çevresindeki Mekanlar`;
    
    // 2. Faz 1'de seçili olan öğeyi (Ana Mekan) koru ve en üste taşı
    const selectedItem = document.querySelector('.vd-result-item.is-selected');
    if (selectedItem) {
        container.appendChild(selectedItem);
    }
    
    // 3. Sonuç Kontrolü
    if (results.length === 0) {
        const noResults = document.createElement('p');
        noResults.className = 'vd-no-results';
        noResults.textContent = 'Seçilen mekan çevresinde, belirlenen yarıçapta başka popüler mekan bulunamadı.';
        container.appendChild(noResults);
        return;
    }

    // 4. Komşu Mekanları Listele ve Linkleri Oluştur
    results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'vd-result-item';
        
        // Faz 2'deki komşu mekanlar için farklı bir renk vurgusu
        item.style.borderLeftColor = 'var(--secondary-color)';
         
    
        const safeQuery = encodeURIComponent(res.name + " " + res.country);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${safeQuery}&query_place_id=${res.lat},${res.lng}`;

        item.innerHTML = `
            <img src="${res.photoUrl}" alt="${res.name}" class="vd-result-img">
            <div class="vd-result-content">
                <h4 class="vd-result-item__title">
                    ${res.name} 
                    <span class="vd-badge-country">${res.country}</span>
                </h4>
                <p class="vd-result-item__detail"><span class="vd-icon vd-icon--map-marker"></span> <strong>Uzaklık:</strong> ${res.distance.toFixed(1)} km</p>
                
                <p style="margin-top: 5px;">
                    <a href="${googleMapsUrl}" target="_blank" 
                       style="color: var(--tertiary-color); font-size: 0.9em; font-weight: 600; text-decoration: none;">
                       Google'da Görüntüle 🌐
                    </a>
                </p>
            </div>
        `;

        // Tıklanınca haritada o noktaya git
        item.addEventListener('click', () => {
            map.setView([res.lat, res.lng], 16);
        });

        container.appendChild(item);
        addMarker(res.lat, res.lng, res.name); // Haritaya komşu mekanları işaretle
    });
    
    // 5. Haritayı merkeze taşı
    if (selectedLocation) {
        map.setView([selectedLocation.lat, selectedLocation.lng], 14);
    }
}

// 4. Hata Yönetimi
function showError(msg) {
    const err = document.getElementById('error-message');
    err.innerHTML = `<span class="vd-icon vd-icon--alert"></span> ${msg}`;
    err.classList.remove('vd-alert--hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('vd-alert--hidden');
}

// 5. TEST VERİSİ 
function getMockResults() {
    console.warn("getMockResults() fonksiyonu artık güncel iş mantığı için kullanılmamaktadır.");
    return [];
}