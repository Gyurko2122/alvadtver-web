if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}

let allPhotos = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("Galéria betöltése indul...");
    loadGalleryPhotos();
});

function loadGalleryPhotos() {
    window.rtdb.ref('photos').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log("Nyers Firebase adatok:", data);
        allPhotos = [];
        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                // Ellenőrizzük, hogy létezik-e az url
                if (item && item.url) {
                    allPhotos.push({ id: key, ...item });
                }
            });
        }
        console.log("Feldolgozott képek tömbje:", allPhotos);
        renderGallery();
    }, (error) => {
        console.error("Firebase olvasási hiba:", error);
    });
}

function renderGallery() {
    const gridView = document.getElementById('grid-view');
    if (!gridView) {
        console.error("A #grid-view elem nem található a HTML-ben!");
        return;
    }

    if (allPhotos.length === 0) {
        gridView.innerHTML = `<p style="color: var(--silver); text-align: center; grid-column: 1 / -1; padding: 2rem;">Még nincsenek érvényes képek a galériában.</p>`;
        return;
    }

    let gridHtml = '';
    allPhotos.forEach((photo) => {
        const imageUrl = photo.url;
        const captionText = photo.caption || '';
        
        gridHtml += `
            <div class="photo-item" onclick="openLightbox('${imageUrl}', '${captionText.replace(/'/g, "\\'")}')" style="cursor: pointer; background: #111; border: 1px solid #333; overflow: hidden; transition: transform 0.2s; min-height: 220px;">
                <img src="${imageUrl}" alt="Galéria kép" style="width: 100%; height: 220px; object-fit: cover; display: block;" onerror="console.error('Nem sikerült betölteni a képet:', this.src)">
                ${captionText ? `<div style="padding: 0.6rem; font-size: 0.9rem; color: var(--silver); text-align: center; font-family: var(--font-head);">${captionText}</div>` : ''}
            </div>
        `;
    });
    gridView.innerHTML = gridHtml;
}

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

window.closeLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};