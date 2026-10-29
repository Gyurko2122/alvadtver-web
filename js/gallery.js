import { getPhotos, getLang, translations } from './storage.js';

let photos = [];
let carouselIndex = 0;

window.initGallery = function() {
    getPhotos().then(data => {
        photos = data;
        const gridView = document.getElementById('grid-view');
        const lang = getLang();
        const dict = translations[lang];

        if (!gridView) return;

        if (photos.length === 0) {
            gridView.innerHTML = `<div class="no-photos-msg" style="grid-column: 1 / -1;">${dict.gallery_empty}</div>`;
            return;
        }

        gridView.innerHTML = photos.map(p => `
            <div class="photo-card">
                <img src="${p.url}" alt="${p.caption || 'AlvadtVér'}">
                <div class="photo-desc">${p.caption || 'AlvadtVér'}</div>
            </div>
        `).join('');

        updateCarousel();
    });
};

window.switchView = function(mode) {
    const gridView = document.getElementById('grid-view');
    const carouselView = document.getElementById('carousel-view');
    const btnGrid = document.getElementById('btn-grid');
    const btnCarousel = document.getElementById('btn-carousel');

    if (mode === 'grid') {
        gridView.classList.add('active');
        carouselView.classList.remove('active');
        btnGrid.classList.add('active');
        btnCarousel.classList.remove('active');
    } else {
        gridView.classList.remove('active');
        carouselView.classList.add('active');
        btnGrid.classList.remove('active');
        btnCarousel.classList.add('active');
    }
};

function updateCarousel() {
    if (photos.length === 0) return;
    const photo = photos[carouselIndex];
    const imgEl = document.getElementById('carousel-img');
    const capEl = document.getElementById('carousel-caption');
    if (imgEl) imgEl.src = photo.url;
    if (capEl) capEl.innerText = `${photo.caption || 'AlvadtVér'} (${carouselIndex + 1} / ${photos.length})`;
}

window.moveCarousel = function(direction) {
    if (photos.length === 0) return;
    carouselIndex += direction;
    if (carouselIndex < 0) carouselIndex = photos.length - 1;
    if (carouselIndex >= photos.length) carouselIndex = 0;
    updateCarousel();
};

document.addEventListener('DOMContentLoaded', window.initGallery);