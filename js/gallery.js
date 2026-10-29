if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}

document.addEventListener('DOMContentLoaded', () => {
    const gridView = document.getElementById('grid-view');
    if (!gridView) return;

    window.rtdb.ref('photos').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            gridView.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Még nincsenek feltöltött képek.</p>';
            return;
        }

        let html = '';
        Object.keys(data).forEach(key => {
            const photo = data[key];
            if (photo && photo.url) {
                // Biztonságos szövegkezelés az idézőjelekhez
                const safeUrl = photo.url.replace(/'/g, "\\'");
                const safeCaption = (photo.caption || '').replace(/'/g, "\\'");

                html += `
                    <div class="photo-card" onclick="openLightbox('${safeUrl}', '${safeCaption}')">
                        <img src="${photo.url}" alt="Galéria kép">
                        <div class="photo-caption">${photo.caption || ''}</div>
                    </div>
                `;
            }
        });

        gridView.innerHTML = html;
    });
});

window.openLightbox = function(url, caption) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');

    if (modal && img) {
        img.src = url;
        cap.innerText = caption;
        modal.classList.add('active'); // Bekapcsolja a smooth animációt
    }
};

window.closeLightbox = function(event) {
    // Ha a háttérre kattintanak (nem a kép tartalmára), bezáródik
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active'); // Lefuttatja a smooth eltűnést
    }
};

window.closeLightboxDirect = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};