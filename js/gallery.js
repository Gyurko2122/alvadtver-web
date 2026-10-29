if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}

let allPhotos = [];

document.addEventListener('DOMContentLoaded', () => {
    loadGalleryPhotos();
});

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

function renderGallery() {
    const gridView = document.getElementById('grid-view');
    if (!gridView) return;

    if (allPhotos.length === 0) {
        gridView.innerHTML = `<p style="color: var(--silver); text-align: center; grid-column: 1 / -1; padding: 2rem;">Még nincsenek feltöltött képek a galériában.</p>`;
        return;
    }

    let gridHtml = '';
    allPhotos.forEach((photo) => {
        // Kattintásra a nagyító lightbox nyílik meg
        gridHtml += `
            <div class="photo-item" onclick="openLightbox('${photo.url}', '${photo.caption || ''}')" style="cursor: pointer; background: #111; border: 1px solid #333; overflow: hidden; transition: transform 0.2s;">
                <img src="${photo.url}" alt="${photo.caption || 'Galéria kép'}" style="width: 100%; height: 220px; object-fit: cover; display: block;">
                ${photo.caption ? `<div style="padding: 0.6rem; font-size: 0.9rem; color: var(--silver); text-align: center; font-family: var(--font-head);">${photo.caption}</div>` : ''}
            </div>
        `;
    });
    gridView.innerHTML = gridHtml;
}

// Lightbox megnyitása nagyban
window.openLightbox = function(url, caption) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');

    if (modal && img) {
        img.src = url;
        cap.innerText = caption;
        modal.style.display = 'flex';
    }
};

// Lightbox bezárása
window.closeLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};