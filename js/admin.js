// Biztonságos inicializálás
if (typeof window.rtdb === 'undefined') {
    window.rtdb = firebase.database();
}
if (typeof window.auth === 'undefined') {
    window.auth = firebase.auth();
}

// Ellenőrizzük a belépést
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

// Admin belépés
window.checkPass = function() {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    const errEl = document.getElementById('login-err');

    window.auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            const modal = document.getElementById('login-modal');
            if (modal) modal.style.display = 'none';
            loadAdminData();
        })
        .catch(() => {
            if (errEl) {
                errEl.style.display = 'block';
                errEl.innerText = "Hibás e-mail vagy jelszó!";
            }
        });
};

function loadAdminData() {
    loadAdminEvents();
    loadAdminPhotos();
    loadAdminMembers();
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

// Kép feltöltése a saját gépről a Firebase Storage-ba (Galéria)
window.handlePhotoSubmit = function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('ph-file');
    const captionInput = document.getElementById('ph-caption');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Kérlek válassz ki egy képet!");
        return;
    }

    const file = fileInput.files[0];
    const caption = captionInput.value;
    const fileName = 'galeria_' + Date.now() + '_' + file.name;
    
    const storageRef = firebase.storage().ref('galeria/' + fileName);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', null, 
        (error) => { alert("Hiba történt a feltöltés során: " + error.message); }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                const id = 'ph_' + Date.now();
                window.rtdb.ref('photos/' + id).set({
                    url: downloadURL,
                    caption: caption,
                    storagePath: 'galeria/' + fileName
                }).then(() => {
                    alert("Kép sikeresen feltöltve!");
                    e.target.reset();
                    loadAdminPhotos();
                });
            });
        }
    );
};

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
                <div style="display:flex; align-items:center; gap: 10px;">
                    <img src="${ph.url}" style="width: 40px; height: 40px; object-fit: cover;">
                    <span><b>${ph.caption || 'Kép'}</b></span>
                </div>
                <button onclick="deletePhoto('${id}', '${ph.storagePath || ''}')" style="background:#ff5252; color:white; border:none; padding:0.3rem 0.6rem; cursor:pointer;">Törlés</button>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

// Zenekari tagok betöltése, mentése és törlése az adminban
function loadAdminMembers() {
    const listEl = document.getElementById('members-list');
    if (!listEl) return;

    window.rtdb.ref('members').once('value').then((snapshot) => {
        const data = snapshot.val();
        let html = '<h3>Mentett Tagok:</h3>';

        if (!data) {
            listEl.innerHTML = html + '<p style="color:var(--silver); font-size:0.8rem;">Még nincsenek testreszabott tagok (az alapértelmezettek jelennek meg).</p>';
            return;
        }

        Object.keys(data).forEach(id => {
            const m = data[id];
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.5rem; margin-bottom:0.5rem; border:1px solid #333;">
                    <div style="display:flex; align-items:center; gap: 10px;">
                        ${m.url ? `<img src="${m.url}" style="width: 40px; height: 40px; object-fit: cover;">` : ''}
                        <span><b>${m.name}</b> - ${m.role}</span>
                    </div>
                    <button onclick="deleteMember('${id}')" style="background:#ff5252; color:white; border:none; padding:0.3rem 0.6rem; cursor:pointer;">Törlés</button>
                </div>
            `;
        });
        listEl.innerHTML = html;
    });
}

window.handleMemberSubmit = function(e) {
    e.preventDefault();
    const memberId = document.getElementById('m-id').value;
    const name = document.getElementById('m-name').value;
    const role = document.getElementById('m-role').value;
    const fileInput = document.getElementById('m-file');

    const saveData = (imageUrl, storagePath) => {
        const payload = { name, role };
        if (imageUrl) {
            payload.url = imageUrl;
            payload.storagePath = storagePath;
        }

        window.rtdb.ref('members/' + memberId).update(payload).then(() => {
            alert("Zenekari tag adatai sikeresen mentve!");
            loadAdminMembers();
        });
    };

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const fileName = 'member_' + memberId + '_' + Date.now() + '_' + file.name;
        const storageRef = firebase.storage().ref('members/' + fileName);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', null, 
            (error) => { alert("Hiba a kép feltöltésekor: " + error.message); },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    saveData(downloadURL, 'members/' + fileName);
                });
            }
        );
    } else {
        saveData(null, null);
    }
};

window.deleteMember = function(id) {
    if (confirm("Biztosan törlöd ezt a tagot a rendszerből?")) {
        window.rtdb.ref('members/' + id).remove().then(() => {
            alert("Tag törölve!");
            loadAdminMembers();
        });
    }
};

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

// Törlések (Adatbázis + Storage)
window.deleteEvent = function(id) {
    if (confirm("Biztosan törlöd ezt a koncertet?")) {
        window.rtdb.ref('events/' + id).remove().then(() => { loadAdminEvents(); });
    }
};

window.deletePhoto = function(id, storagePath) {
    if (confirm("Biztosan törlöd ezt a képet a szerverről és az adatbázisból is?")) {
        const dbDelete = window.rtdb.ref('photos/' + id).remove();
        let storageDelete = Promise.resolve();
        if (storagePath) {
            storageDelete = firebase.storage().ref(storagePath).delete().catch(err => console.log("Storage törlési hiba:", err));
        }
        Promise.all([dbDelete, storageDelete]).then(() => {
            alert("Kép sikeresen törölve mindenhol!");
            loadAdminPhotos();
        });
    }
};