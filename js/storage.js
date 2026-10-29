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

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});

// --- KONCERTEK FIGYELÉSE ---
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