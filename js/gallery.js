if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Galéria indítása...");
    const gridView = document.getElementById('grid-view');
    
    if (!gridView) {
        console.error("HIBA: A #grid-view elem nem található a galeria.html-ben!");
        return;
    }

    window.rtdb.ref('photos').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log("Lekért adatok a Firebase-ből:", data);

        if (!data) {
            gridView.innerHTML = '<p style="color: white; font-size: 20px; text-align: center; padding: 50px;">Még nincsenek képek az adatbázisban.</p>';
            return;
        }

        let html = '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding: 20px;">';
        
        Object.keys(data).forEach(key => {
            const photo = data[key];
            if (photo && photo.url) {
                html += `
                    <div style="background: #222; border: 2px solid #ff5252; padding: 10px; border-radius: 8px; width: 280px; text-align: center;">
                        <img src="${photo.url}" alt="Galéria kép" style="width: 100%; height: 200px; object-fit: cover; display: block; border-radius: 4px;" onclick="window.open('${photo.url}', '_blank')">
                        <p style="color: white; margin-top: 10px; font-weight: bold;">${photo.caption || 'Nincs cím'}</p>
                    </div>
                `;
            }
        });

        html += '</div>';
        gridView.innerHTML = html;
        console.log("Képek sikeresen kirajzolva a DOM-ba!");
    }, (error) => {
        console.error("Firebase hiba:", error);
    });
});