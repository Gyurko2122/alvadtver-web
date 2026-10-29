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
        about_text: "Üdvözlünk az AlvadtVér hivatalos oldalán! Mi egy ajkai alapítású metálzenekar vagyunk. Célunk, hogy nyers energiát és kompromisszummentes zenét hozzunk a színpadra.",
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
        about_text: "Welcome to the official website of AlvadtVér! We are an underground metal band from Ajka. Our goal is to bring raw energy and uncompromising music to the stage.",
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
        about_text: "Willkommen auf der offiziellen Website von AlvadtVér! Wir sind eine Underground-Metal-Band aus Ajka. Unser Ziel ist es, rohe Energie auf die Bühne zu bringen.",
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
    location.reload();
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

// --- KONCERTEK LOGIKA ÉS VISSZASZÁMLÁLÁS ---
window.listenToUpcomingEvents = function(callback) {
    if (typeof window.rtdb === 'undefined') {
        window.rtdb = firebase.database();
    }
    window.rtdb.ref('events').on('value', (snapshot) => {
        const data = snapshot.val();
        const events = [];
        if (data) {
            Object.keys(data).forEach(key => {
                events.push({ id: key, ...data[key] });
            });
        }
        events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        callback(events);
    });
};

let countdownInterval = null;
let latestEventsCache = [];

window.refreshMainEvents = function() {
    if (latestEventsCache.length > 0) renderEvents(latestEventsCache);
};

function renderEvents(events) {
    latestEventsCache = events;
    const container = document.getElementById('events-display');
    const lang = window.getLang();
    const dict = translations[lang] || translations.hu;
    let locale = lang === 'hu' ? 'hu-HU' : (lang === 'de' ? 'de-DE' : 'en-US');

    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `<div class="no-concerts-msg">${dict.no_concerts}</div>`;
        return;
    }

    const now = new Date();
    const first = events.find(e => now >= new Date(e.datetime) && now <= (e.endtime ? new Date(e.endtime) : new Date(new Date(e.datetime).getTime() + 3*60*60*1000))) || events[0];
    
    const startObj = new Date(first.datetime);
    const endObj = first.endtime ? new Date(first.endtime) : new Date(startObj.getTime() + 3*60*60*1000);
    const isLiveNow = now >= startObj && now <= endObj;

    const dateFormatted = startObj.toLocaleString(locale, {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit'
    });

    let html = `
        <div class="featured-gig ${isLiveNow ? 'live-now' : ''}">
            ${isLiveNow ? `<div class="live-badge">${dict.live_badge}</div>` : `<span class="featured-badge">${dict.next_gig}</span>`}
            <h3 class="gig-title">${first.title}</h3>
            <div class="gig-details">
                <p>📍 <strong>${first.location}</strong></p>
                <p>📅 <strong>${dateFormatted}</strong></p>
            </div>
            ${!isLiveNow ? `
            <div class="countdown">
                <div class="count-box"><div id="cd-days" class="count-num">00</div><div class="count-label">${dict.days}</div></div>
                <div class="count-box"><div id="cd-hours" class="count-num">00</div><div class="count-label">${dict.hours}</div></div>
                <div class="count-box"><div id="cd-mins" class="count-num">00</div><div class="count-label">${dict.mins}</div></div>
                <div class="count-box"><div id="cd-secs" class="count-num">00</div><div class="count-label">${dict.secs}</div></div>
            </div>` : `<div style="margin: 1rem 0; font-family: var(--font-head); color: #00e676; font-size: 1.2rem; text-transform: uppercase;">A koncert jelenleg zajlik! / Live in progress!</div>`}
            
            <div class="gig-actions">
                <a href="${getGoogleMapsUrl(first.location)}" target="_blank" class="btn btn-red">${dict.btn_map}</a>
                <a href="${getGoogleCalendarUrl(first)}" target="_blank" class="btn btn-outline">${dict.btn_calendar}</a>
            </div>
        </div>
    `;

    container.innerHTML = html;
    if (!isLiveNow) initCountdown(startObj.getTime());
}

function initCountdown(targetTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    const update = () => {
        const now = new Date().getTime();
        const diff = targetTime - now;
        if (diff <= 0) {
            location.reload();
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

// --- ZENEKARI TAGOK BETÖLTÉSE ÉS KIRAJZOLÁSA ---
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();

    if (typeof window.listenToUpcomingEvents === 'function') {
        window.listenToUpcomingEvents((events) => { 
            renderEvents(events); 
        });
    }

    if (typeof window.rtdb === 'undefined') {
        window.rtdb = firebase.database();
    }

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
                        <img src="border.png?v=2" alt="Blood Border" class="blood-overlay">
                    </div>
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
});