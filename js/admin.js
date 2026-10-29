// Biztonságos inicializálás, hogy ne legyen redeclaration hiba
if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}
if (typeof window.auth === 'undefined') {
    window.auth = firebase.auth();
}

// Ellenőrizzük, hogy be van-e már lépve, vagy mutassuk a modalt
document.addEventListener('DOMContentLoaded', () => {
    window.auth.onAuthStateChanged((user) => {
        const modal = document.getElementById('login-modal');
        if (user) {
            if (modal) modal.style.display = 'none';
            loadAdminData();
        } else {
            if (modal) modal.style.display = 'flex';
        }
    });
});

// Admin belépés ellenőrzése (globálisan elérhetővé téve)
window.checkPass = function() {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    const errEl = document.getElementById('login-err');

    window.auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const modal = document.getElementById('login-modal');
            if (modal) modal.style.display = 'none';
            loadAdminData();
        })
        .catch((error) => {
            if (errEl) {
                errEl.style.display = 'block';
                errEl.innerText = "Hibás e-mail vagy jelszó!";
            }
        });
};

// Admin adatok betöltése
async function loadAdminData() {
    loadAdminEvents();
    loadAdminPhotos();
}

async function loadAdminEvents() {
    const listEl = document.getElementById('events-list');
    if (!listEl) return;

    const snapshot = await window.rtdb.ref('events').once('value');
    const data = snapshot.val();
    let html = '<h3>Működő koncertek:</h3>';

    if (!data) {
        listEl.innerHTML = html + '<p style="color:var(--silver); font-size:0.8rem;">Még nincs rögzített koncert.</p>';
        return;
    }

    Object.keys(data).forEach(id => {
        const ev = data[id];
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.5rem; margin-bottom:0.5rem; border:1px solid #333;">
                <span><b>${ev.title}</b> (${ev.location}) - ${ev.datetime}</span>
                <button onclick="deleteEvent('${id}')" style="background:#ff5252; color:white; border:none; padding:0.3rem 0.6rem; cursor:pointer;">Törlés</button>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

async function loadAdminPhotos() {
    const listEl = document.getElementById('photos-list');
    if (!listEl) return;

    const snapshot = await window.rtdb.ref('photos').once('value');
    const data = snapshot.val();
    let html = '<h3>Feltöltött képek:</h3>';

    if (!data) {
        listEl.innerHTML = html + '<p style="color:var(--silver); font-size:0.8rem;">Még nincs feltöltött kép.</p>';
        return;
    }

    Object.keys(data).forEach(id => {
        const ph = data[id];
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.5rem; margin-bottom:0.5rem; border:1px solid #333;">
                <span><b>${ph.caption || 'Kép'}</b> (${ph.url})</span>
                <button onclick="deletePhoto('${id}')" style="background:#ff5252; color:white; border:none; padding:0.3rem 0.6rem; cursor:pointer;">Törlés</button>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

// Koncert mentés
window.handleEventSubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('ev-title').value;
    const location = document.getElementById('ev-location').value;
    const datetime = document.getElementById('ev-datetime').value;
    const endtime = document.getElementById('ev-endtime').value;
    const id = 'ev_' + Date.now();

    window.rtdb.ref('events/' + id).set({
        title, location, datetime, endtime
    }).then(() => {
        alert("Koncert sikeresen mentve!");
        e.target.reset();
        loadAdminEvents();
    });
};

// Kép mentés
window.handlePhotoSubmit = function(e) {
    e.preventDefault();
    const url = document.getElementById('ph-url').value;
    const caption = document.getElementById('ph-caption').value;
    const id = 'ph_' + Date.now();

    window.rtdb.ref('photos/' + id).set({
        url, caption
    }).then(() => {
        alert("Kép sikeresen hozzáadva!");
        e.target.reset();
        loadAdminPhotos();
    });
};

// Törlések
window.deleteEvent = function(id) {
    if (confirm("Biztosan törlöd ezt a koncertet?")) {
        window.rtdb.ref('events/' + id).remove().then(() => { loadAdminEvents(); });
    }
};

window.deletePhoto = function(id) {
    if (confirm("Biztosan törlöd ezt a képet?")) {
        window.rtdb.ref('photos/' + id).remove().then(() => { loadAdminPhotos(); });
    }
};