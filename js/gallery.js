// Biztonságos inicializálás
if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}

let allPhotos = [];
let currentIndex = 0;
let currentViewMode = 'grid';

document.addEventListener('DOMContentLoaded', () => {
    loadGalleryPhotos();
});

// Képek betöltése a Realtime Database-ből
function loadGalleryPhotos() {
    window.rtdb.ref('photos').on('value', (snapshot) => {
        const data = snapshot.val();
        allPhotos = [];
        if (data) {
            Object.keys(data).forEach(key => {
                allPhotos.push({ id: key, ...data[key] });
            });
        }
        renderGallery();
    });
}

// Galéria kirajzolása (rács vagy diavetítő)
function renderGallery() {
    const gridView = document.getElementById('grid-view');
    if (!gridView) return;

    if (allPhotos.length === 0) {
        gridView.innerHTML = `<p style="color: var(--silver); text-align: center; grid-column: 1 / -1; padding: 2rem;" data-i18n="gallery_empty">Még nincsenek feltöltött képek a galériában.</p>`;
        return;
    }

    // Rács nézet HTML generálás
    let gridHtml = '';
    allPhotos.forEach((photo, index) => {
        gridHtml += `
            <div class="photo-item" onclick="openCarouselAt(${index})" style="cursor: pointer; background: #111; border: 1px solid #333; overflow: hidden;">
                <img src="${photo.url}" alt="${photo.caption || 'Galéria kép'}" style="width: 100%; height: 200px; object-fit: cover; display: block;">
                ${photo.caption ? `<div style="padding: 0.5rem; font-size: 0.85rem; color: var(--silver); text-align: center;">${photo.caption}</div>` : ''}
            </div>
        `;
    });
    gridView.innerHTML = gridHtml;

    if (allPhotos.length > 0) {
        updateCarouselImage();
    }
}

// Nézet váltás (Rács / Diavetítő)
window.switchView = function(mode) {
    currentViewMode = mode;
    const gridView = document.getElementById('grid-view');
    const carouselView = document.getElementById('carousel-view');
    const btnGrid = document.getElementById('btn-grid');
    const btnCarousel = document.getElementById('btn-carousel');

    if (mode === 'grid') {
        if (gridView) gridView.style.display = 'grid';
        if (carouselView) carouselView.style.display = 'none';
        if (btnGrid) btnGrid.classList.add('active');
        if (btnCarousel) btnCarousel.classList.remove('active');
    } else {
        if (gridView) gridView.style.display = 'none';
        if (carouselView) carouselView.style.display = 'block';
        if (btnGrid) btnGrid.classList.remove('active');
        if (btnCarousel) btnCarousel.classList.add('active');
        updateCarouselImage();
    }
};

// Diavetítő léptetése
window.moveCarousel = function(direction) {
    if (allPhotos.length === 0) return;
    currentIndex += direction;
    if (currentIndex < 0) {
        currentIndex = allPhotos.length - 1;
    } else if (currentIndex >= allPhotos.length) {
        currentIndex = 0;
    }
    updateCarouselImage();
};

window.openCarouselAt = function(index) {
    currentIndex = index;
    window.switchView('carousel');
};

function updateCarouselImage() {
    const imgEl = document.getElementById('carousel-img');
    const captionEl = document.getElementById('carousel-caption');
    if (allPhotos.length === 0) return;

    const currentPhoto = allPhotos[currentIndex];
    if (imgEl) imgEl.src = currentPhoto.url;
    if (captionEl) captionEl.innerText = currentPhoto.caption || '';
}