import { auth, getAdminEvents, saveEventToCloud, deleteEventFromCloud, getPhotos, savePhotoToCloud, deletePhotoFromCloud } from './storage.js';
import { signInWithEmailAndPassword } from "firebase/auth";

window.checkPass = async function() {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        document.getElementById('login-modal').style.display = 'none';
        renderAllLists();
    } catch (error) {
        const errEl = document.getElementById('login-err');
        if (errEl) errEl.style.display = 'block';
    }
};

async function renderAllLists() {
    renderEventsList();
    renderPhotosList();
}

async function renderEventsList() {
    const events = await getAdminEvents();
    events.sort((a,b) => new Date(a.datetime) - new Date(b.datetime));
    const container = document.getElementById('events-list');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `<p style="color: var(--silver); font-size:0.85rem;">Nincs rögzített koncert.</p>`;
        return;
    }
    container.innerHTML = events.map(e => `
        <div class="list-item">
            <div>
                <strong>${e.title}</strong><br>
                <small style="color:var(--silver)">📍 ${e.location} | Kezdés: ${new Date(e.datetime).toLocaleString('hu-HU')}</small>
            </div>
            <button class="btn-delete" onclick="handleDeleteEvent('${e.id}')">Törlés</button>
        </div>
    `).join('');
}

window.handleEventSubmit = async function(e) {
    e.preventDefault();
    const newEvent = {
        id: Date.now().toString(),
        title: document.getElementById('ev-title').value,
        location: document.getElementById('ev-location').value,
        datetime: document.getElementById('ev-datetime').value,
        endtime: document.getElementById('ev-endtime').value
    };
    await saveEventToCloud(newEvent);
    e.target.reset();
    renderEventsList();
    alert("Koncert mentve a felhőbe!");
};

window.handleDeleteEvent = async function(id) {
    if (confirm("Biztosan törlöd?")) {
        await deleteEventFromCloud(id);
        renderEventsList();
    }
};

async function renderPhotosList() {
    const photos = await getPhotos();
    const container = document.getElementById('photos-list');
    if (!container) return;
    container.innerHTML = photos.map(p => `
        <div class="list-item">
            <div style="display:flex; align-items:center; gap:1rem;">
                <img src="${p.url}" alt="Thumb" style="width:50px; height:40px; object-fit:cover;">
                <div><strong>${p.caption || 'Kép'}</strong></div>
            </div>
            <button class="btn-delete" onclick="handleDeletePhoto('${p.id}')">Törlés</button>
        </div>
    `).join('');
}

window.handlePhotoSubmit = async function(e) {
    e.preventDefault();
    const urlInput = document.getElementById('ph-url').value.trim();
    const caption = document.getElementById('ph-caption').value.trim();
    if (urlInput) {
        await savePhotoToCloud({ id: Date.now().toString(), url: urlInput, caption: caption });
        e.target.reset();
        renderPhotosList();
        alert("Kép hozzáadva!");
    }
};

window.handleDeletePhoto = async function(id) {
    await deletePhotoFromCloud(id);
    renderPhotosList();
};