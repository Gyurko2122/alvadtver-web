// --- FORDÍTÁSOK ÉS NYELVKEZELÉS ---
const translations = {
    hu: {
        ticker_1: "ALVADTVÉR: AJKAI UNDERGROUND METAL",
        ticker_2: "ÚJ FOTÓK: KERESD A GALÉRIÁBAN",
        ticker_3: "BOOKING: ALVADTVEROFFICIAL@GMAIL.COM",
        nav_concerts: "Koncertek",
        nav_news: "Hírek",
        nav_band: "A Banda",
        nav_gallery: "Galéria",
        nav_about: "Rólunk",
        hero_sub: "AJKAI UNDERGROUND METAL",
        title_concerts: "Koncertek",
        title_follow: "Kövess minket",
        title_about: "Rólunk",
        title_news: "Hírek",
        title_band: "A Banda",
        about_text: "AlvadtVér egy fiatal, energikus banda Ajkáról, 2024-ben alakultak hárman. Metál műfajban zenélnek. Első albumuk Ínséges idők néven hamarosan meg fog jelenni addig is a közösségi médián feldolgozott zenéket játszanak. Családi banda, akik a rock és metál műfajokban utaznak. Zenei pályafutásukat a barátság és a közös érdeklődés hozta össze, és azóta is együtt játszanak.",
        news_date: "2026. OKTÓBER 26.",
        news_title: "Elkészült az új weboldalunk!",
        news_text: "Itt mindig megtaláljátok a legfrissebb koncertdátumokat, híreket és a fellépéseken készült fotókat. Tartsátok rajtunk a szemeteket!",
        role_voc_bass: "Ének / Basszusgitár",
        role_gui: "Gitár",
        role_drum: "Dob",
        footer_book: "Kapcsolat / Booking:",
        footer_rights: "© 2026 AlvadtVér. Minden jog fenntartva.",
        no_concerts: "Jelenleg nincsenek rögzített koncertek.",
        live_badge: "ÉLŐBEN!",
        next_gig: "Következő Koncert",
        days: "Nap",
        hours: "Óra",
        mins: "Perc",
        secs: "Mp",
        btn_map: "Helyszín (Google Maps)",
        btn_calendar: "Mentés Naptárba"
    },
    en: {
        ticker_1: "ALVADTVÉR: AJKAI UNDERGROUND METAL",
        ticker_2: "NEW PHOTOS: CHECK THE GALLERY",
        ticker_3: "BOOKING: ALVADTVEROFFICIAL@GMAIL.COM",
        nav_concerts: "Concerts",
        nav_news: "News",
        nav_band: "The Band",
        nav_gallery: "Gallery",
        nav_about: "About",
        hero_sub: "AJKAI UNDERGROUND METAL",
        title_concerts: "Concerts",
        title_follow: "Follow Us",
        title_about: "About Us",
        title_news: "News",
        title_band: "The Band",
        about_text: "AlvadtVér is a young, energetic band from Ajka, formed by three members in 2024. They play metal music. Their upcoming debut album titled Ínséges idők will be released soon; in the meantime, they play cover songs on social media. A family band traveling through rock and metal genres.",
        news_date: "OCTOBER 26, 2026",
        news_title: "Our new website is live!",
        news_text: "Here you will always find the latest concert dates, news, and photos taken at our gigs. Keep your eyes on us!",
        role_voc_bass: "Vocals / Bass",
        role_gui: "Guitar",
        role_drum: "Drums",
        footer_book: "Contact / Booking:",
        footer_rights: "© 2026 AlvadtVér. All rights reserved.",
        no_concerts: "No upcoming concerts at the moment.",
        live_badge: "LIVE NOW!",
        next_gig: "Next Gig",
        days: "Days",
        hours: "Hours",
        mins: "Mins",
        secs: "Secs",
        btn_map: "Location (Google Maps)",
        btn_calendar: "Add to Calendar"
    },
    de: {
        ticker_1: "ALVADTVÉR: AJKAI UNDERGROUND METAL",
        ticker_2: "NEUE FOTOS: BESUCHEN SIE DIE GALERIE",
        ticker_3: "BOOKING: ALVADTVEROFFICIAL@GMAIL.COM",
        nav_concerts: "Konzerte",
        nav_news: "News",
        nav_band: "Die Band",
        nav_gallery: "Galerie",
        nav_about: "Über uns",
        hero_sub: "AJKAI UNDERGROUND METAL",
        title_concerts: "Konzerte",
        title_follow: "Folgt uns",
        title_about: "Über uns",
        title_news: "News",
        title_band: "Die Band",
        about_text: "AlvadtVér ist eine junge, energische Band aus Ajka, die 2024 von drei Mitgliedern gegründet wurde. Sie spielen Metal. Ihr kommendes Debütalbum mit dem Titel Ínséges idők wird bald erscheinen.",
        news_date: "26. OKTOBER 2026",
        news_title: "Unsere neue Website ist da!",
        news_text: "Hier findet ihr immer die neuesten Konzerttermine, News und Fotos von unseren Auftritten.",
        role_voc_bass: "Gesang / Bass",
        role_gui: "Gitarre",
        role_drum: "Schlagzeug",
        footer_book: "Kontakt / Booking:",
        footer_rights: "© 2026 AlvadtVér. Alle Rechte vorbehalten.",
        no_concerts: "Derzeit keine Konzerte geplant.",
        live_badge: "LIVE JETZT!",
        next_gig: "Nächster Auftritt",
        days: "Tage",
        hours: "Stunden",
        mins: "Min",
        secs: "Sek",
        btn_map: "Standort (Google Maps)",
        btn_calendar: "In Kalender eintragen"
    }
};

window.setLang = function(lang) {
    localStorage.setItem('alvadtver_lang', lang);
    applyTranslations();
    loadAndRenderEvents();
};

window.getLang = function() {
    return localStorage.getItem('alvadtver_lang') || 'hu';
};

function applyTranslations() {
    const lang = window.getLang();
    const dict = translations[lang];
    if (!dict) return;

    const langTextEl = document.getElementById('current-lang-text');
    if (langTextEl) langTextEl.innerText = lang.toUpperCase();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });
}

// --- KONCERTEK EGYSZERI BETÖLTÉSE ÉS AUTOMATIKUS TISZTÍTÁSA (Adminból is töröl) ---
let countdownInterval = null;

window.listenToUpcomingEvents = function(callback) {
    if (typeof window.rtdb === 'undefined') {
        window.rtdb = firebase.database();
    }
    
    // Egyszeri lekérés (.once), ami nem okoz végtelen hurkot, de a lejártat törli az adatbázisból is!
    window.rtdb.ref('events').once('value', (snapshot) => {
        const data = snapshot.val();
        const events = [];
        const now = new Date();

        if (data) {
            Object.keys(data).forEach(key => {
                const event = data[key];
                const startObj = new Date(event.datetime);
                const endObj = event.endtime ? new Date(event.endtime) : new Date(startObj.getTime() + 3 * 60 * 60 * 1000);

                // Ha lejárt, töröljük a Firebase-ből is, hogy az admin panelből is eltűnjön
                if (now > endObj) {
                    window.rtdb.ref('events/' + key).remove();
                } else {
                    events.push({ id: key, ...event });
                }
            });
        }
        
        events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        callback(events);
    });
};

function loadAndRenderEvents() {
    window.listenToUpcomingEvents((events) => {
        renderEvents(events);
    });
}

function renderEvents(events) {
    const container = document.getElementById('events-display');
    const lang = window.getLang();
    const dict = translations[lang] || translations.hu;
    let locale = lang === 'hu' ? 'hu-HU' : (lang === 'de' ? 'de-DE' : 'en-US');

    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `<div class="no-concerts-msg" style="padding: 2rem; text-align: center; color: var(--silver); background: var(--card-bg); border-radius: 4px; border: 1px solid var(--border-silver);">${dict.no_concerts}</div>`;
        if (countdownInterval) clearInterval(countdownInterval);
        return;
    }

    const first = events[0];
    const second = events.length > 1 ? events[1] : null;

    let html = '';
    const now = new Date();
    const startObj1 = new Date(first.datetime);
    const endObj1 = first.endtime ? new Date(first.endtime) : new Date(startObj1.getTime() + 3 * 60 * 60 * 1000);
    const isLiveNow1 = now >= startObj1 && now <= endObj1;
    
    const dateFormatted1 = startObj1.toLocaleString(locale, {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit'
    });

    html += `
        <div class="featured-gig ${isLiveNow1 ? 'live-now' : ''}">
            ${isLiveNow1 ? `<div class="live-badge">${dict.live_badge}</div>` : `<span class="featured-badge">${dict.next_gig}</span>`}
            <h3 class="gig-title">${first.title}</h3>
            <div class="gig-details">
                <p>📍 <strong>${first.location}</strong></p>
                <p>📅 <strong>${dateFormatted1}</strong></p>
            </div>
            ${!isLiveNow1 ? `
            <div class="countdown">
                <div class="count-box"><div id="cd-days" class="count-num">00</div><div class="count-label">${dict.days}</div></div>
                <div class="count-box"><div id="cd-hours" class="count-num">00</div><div class="count-label">${dict.hours}</div></div>
                <div class="count-box"><div id="cd-mins" class="count-num">00</div><div class="count-label">${dict.mins}</div></div>
                <div class="count-box"><div id="cd-secs" class="count-num">00</div><div class="count-label">${dict.secs}</div></div>
            </div>` : `<div style="margin: 1rem 0; font-family: var(--font-head); color: #00e676; font-size: 1.2rem; text-transform: uppercase;">A koncert jelenleg zajlik!</div>`}
            
            <div class="gig-actions">
                <a href="${getGoogleMapsUrl(first.location)}" target="_blank" class="btn btn-red">${dict.btn_map}</a>
                <a href="${getGoogleCalendarUrl(first)}" target="_blank" class="btn btn-outline">${dict.btn_calendar}</a>
            </div>
        </div>
    `;

    if (second) {
        const startObj2 = new Date(second.datetime);
        const dateFormatted2 = startObj2.toLocaleString(locale, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        html += `
            <div class="small-gig-card" style="margin-top: 1rem;">
                <span style="font-size: 0.75rem; color: var(--silver); text-transform: uppercase; letter-spacing: 1px;">Ezután következik</span>
                <h4 style="font-family: var(--font-head); font-size: 1.1rem; color: #fff; margin: 0.4rem 0;">${second.title}</h4>
                <div style="font-size: 0.85rem; color: var(--silver);">
                    <p style="margin-bottom: 0.2rem;">📍 ${second.location}</p>
                    <p>📅 ${dateFormatted2}</p>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    if (countdownInterval) clearInterval(countdownInterval);

    if (!isLiveNow1) {
        initCountdown(startObj1.getTime());
    } else {
        const timeUntilEnd = endObj1.getTime() - now.getTime();
        countdownInterval = setTimeout(() => {
            loadAndRenderEvents();
        }, timeUntilEnd);
    }
}

function initCountdown(targetTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    const update = () => {
        const now = new Date().getTime();
        const diff = targetTime - now;
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            loadAndRenderEvents(); // Ha lejár, frissítünk és törlünk
            return;
        }
        
        const dEl = document.getElementById("cd-days");
        const hEl = document.getElementById("cd-hours");
        const mEl = document.getElementById("cd-mins");
        const sEl = document.getElementById("cd-secs");
        
        if (dEl) dEl.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
        if (hEl) hEl.innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        if (mEl) mEl.innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        if (sEl) sEl.innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    };
    
    update();
    countdownInterval = setInterval(update, 1000);
}

function getGoogleMapsUrl(location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function getGoogleCalendarUrl(event) {
    const start = new Date(event.datetime).toISOString().replace(/-|:|\.\d\d\d/g,"");
    const end = event.endtime ? new Date(event.endtime).toISOString().replace(/-|:|\.\d\d\d/g,"") : start;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&location=${encodeURIComponent(event.location)}`;
}

// --- FŐ INICIALIZÁLÁS ÉS FIREBASE ADATOK ---
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    loadAndRenderEvents();

    if (typeof window.rtdb === 'undefined') {
        window.rtdb = firebase.database();
    }

    // 1. Zene adatok betöltése a Firebase-ből
    window.rtdb.ref('settings/music').on('value', (snapshot) => {
        const musicData = snapshot.val();
        const audioEl = document.getElementById('bg-audio');
        const titleEl = document.getElementById('track-title');

        if (musicData && audioEl && titleEl) {
            if (musicData.url) {
                if (audioEl.src !== musicData.url) {
                    audioEl.src = musicData.url;
                }
            }
            if (musicData.title) {
                titleEl.innerText = musicData.title;
            }
            audioEl.volume = 0.2;
        } else if (titleEl) {
            titleEl.innerText = "AlvadtVér - Nincs zene";
        }
    });

    // 2. Zenekari tagok betöltése a Firebase-ből
    window.rtdb.ref('members').on('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('band-grid-container');
        if (!container) return;

        const defaults = {
            tomor: { name: "Tomor Nimród", role: "Ének / Basszusgitár", url: "tomor.jpg" },
            buzas: { name: "Buzás Ádám", role: "Gitár", url: "buzas.jpg" },
            szabo: { name: "Szabó Martin", role: "Gitár", url: "szabo.jpg" },
            rozsa: { name: "Rózsa Dániel", role: "Dob", url: "rozsa.jpg" }
        };

        let html = '';
        ['tomor', 'buzas', 'szabo', 'rozsa'].forEach(key => {
            const member = (data && data[key]) ? data[key] : defaults[key];
            const imgUrl = (member.url && member.url.trim() !== '') ? member.url : defaults[key].url;
            
            html += `
                <div class="member-card">
                    <div class="member-img-wrapper">
                        <img src="${imgUrl}" alt="${member.name}" class="member-photo" onerror="this.src='logo.png'">
                        <img src="border-uj.png" alt="Blood Border" class="blood-overlay">
                    </div>
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-role">${member.role}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
});

// --- LEBEGŐ ZENELEJÁTSZÓ VEZÉRLÉSE ---
function togglePlay() {
    const playBtn = document.getElementById('play-btn');
    const aud = document.getElementById('bg-audio');
    if (!aud || !aud.src) return;
    
    if (aud.paused) {
        aud.play().then(() => {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(e => console.log("Lejátszási hiba:", e));
    } else {
        aud.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function setVolume(val) {
    const aud = document.getElementById('bg-audio');
    if (aud) {
        aud.volume = val;
    }
}