import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, get } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const LANG_STORAGE_KEY = 'alvadtver_lang';

// NYELVI SZÓTÁR (i18n)
export const translations = {
    hu: {
        nav_concerts: "Koncertek", nav_news: "Hírek", nav_band: "A Banda", nav_gallery: "Galéria", nav_about: "Rólunk",
        hero_sub: "AJKAI UNDERGROUND METAL",
        title_concerts: "Koncertek", title_follow: "Kövess minket", title_about: "Rólunk", title_news: "Hírek", title_band: "A Banda",
        no_concerts: "Nincs a közeljövőben koncertünk",
        next_gig: "🔥 Legközelebbi Fellépés",
        live_badge: "🔥 ÉPPEN ZAJLIK!",
        btn_map: "📍 Térkép", btn_calendar: "📅 Naptárba",
        days: "Nap", hours: "Óra", mins: "Perc", secs: "Mpd",
        about_text: "Üdvözlünk az AlvadtVér hivatalos oldalán! Mi egy ajkai alapítású metálzenekar vagyunk. Célunk, hogy nyers energiát és kompromisszummentes zenét hozzunk a színpadra.",
        news_date: "2026. OKTÓBER 26.", news_title: "Elkészült az új weboldalunk!", news_text: "Itt mindig megtaláljátok a legfrissebb koncertdátumokat, híreket és a fellépéseken készült fotókat. Tartsátok rajtunk a szemeteket!",
        role_voc_bass: "Ének / Basszusgitár", role_gui: "Gitár", role_drum: "Dob",
        footer_book: "Kapcsolat / Booking:", footer_rights: "© 2026 AlvadtVér. Minden jog fenntartva.",
        lang_hu: "HUN", lang_en: "ENG", lang_de: "GER",
        gallery_title: "Fotógaléria", gallery_back: "← Vissza a főoldalra", gallery_grid: "📷 Rács Nézet", gallery_carousel: "🎞️ Diavetítő", gallery_empty: "Még nincsenek feltöltött képek a galériában."
    },
    en: {
        nav_concerts: "Concerts", nav_news: "News", nav_band: "The Band", nav_gallery: "Gallery", nav_about: "About Us",
        hero_sub: "UNDERGROUND METAL FROM AJKA",
        title_concerts: "Concerts", title_follow: "Follow Us", title_about: "About Us", title_news: "News", title_band: "The Band",
        no_concerts: "No upcoming concerts at the moment",
        next_gig: "🔥 Next Gig",
        live_badge: "🔥 LIVE NOW!",
        btn_map: "📍 Map", btn_calendar: "📅 Calendar",
        days: "Days", hours: "Hrs", mins: "Min", secs: "Sec",
        about_text: "Welcome to the official AlvadtVér website! We are a metal band based in Ajka. Our goal is to bring raw energy and uncompromising music to the stage.",
        news_date: "OCTOBER 26, 2026", news_title: "Our new website is live!", news_text: "Here you will always find our latest concert dates, news, and live photos. Keep an eye on us!",
        role_voc_bass: "Vocals / Bass", role_gui: "Guitar", role_drum: "Drums",
        footer_book: "Contact / Booking:", footer_rights: "© 2026 AlvadtVér. All rights reserved.",
        lang_hu: "HUN", lang_en: "ENG", lang_de: "GER",
        gallery_title: "Photo Gallery", gallery_back: "← Back to Home", gallery_grid: "📷 Grid View", gallery_carousel: "🎞️ Slideshow", gallery_empty: "No photos uploaded to the gallery yet."
    },
    de: {
        nav_concerts: "Konzerte", nav_news: "Neuigkeiten", nav_band: "Die Band", nav_gallery: "Galerie", nav_about: "Über uns",
        hero_sub: "UNDERGROUND METAL AUS AJKA",
        title_concerts: "Konzerte", title_follow: "Folge uns", title_about: "Über uns", title_news: "Neuigkeiten", title_band: "Die Band",
        no_concerts: "Derzeit keine anstehenden Konzerte",
        next_gig: "🔥 Nächster Auftritt",
        live_badge: "🔥 LÄUFT JETZT!",
        btn_map: "📍 Karte", btn_calendar: "📅 Kalender",
        days: "Tage", hours: "Std", mins: "Min", secs: "Sek",
        about_text: "Willkommen auf der offiziellen AlvadtVér Website! Wir sind eine Metal-Band aus Ajka. Unser Ziel ist es, rohe Energie und kompromisslose Musik auf die Bühne zu bringen.",
        news_date: "26. OKTOBER 2026", news_title: "Unsere neue Website ist online!", news_text: "Hier findet ihr immer unsere neuesten Konzerttermine, Neuigkeiten und Live-Fotos. Behaltet uns im Auge!",
        role_voc_bass: "Gesang / Bass", role_gui: "Gitarre", role_drum: "Schlagzeug",
        footer_book: "Kontakt / Booking:", footer_rights: "© 2026 AlvadtVér. Alle Rechte vorbehalten.",
        lang_hu: "HUN", lang_en: "ENG", lang_de: "GER",
        gallery_title: "Fotogalerie", gallery_back: "← Zurück zur Startseite", gallery_grid: "📷 Rasteransicht", gallery_carousel: "🎞️ Diashow", gallery_empty: "Noch keine Bilder in der Galerie hochgeladen."
    }
};

export function getLang() { 
    return localStorage.getItem(LANG_STORAGE_KEY) || 'hu'; 
}

export function setLang(langCode) {
    localStorage.setItem(LANG_STORAGE_KEY, langCode);
    applyTranslations();
    if (typeof window.refreshMainEvents === 'function') window.refreshMainEvents();
    if (typeof window.initGallery === 'function') window.initGallery();
}

export function applyTranslations() {
    const lang = getLang();
    const dict = translations[lang];
    if (!dict) return;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
    });
    const langLabel = document.getElementById('current-lang-text');
    if (langLabel) langLabel.innerText = dict['lang_' + lang];
}

// Globálissá tesszük a setLang-ot, hogy a HTML-beli onclick="setLang(...)" gombok elérjék!
window.setLang = setLang;

document.addEventListener('DOMContentLoaded', applyTranslations);

// --- REALTIME DB FÜGGVÉNYEK ---
export function listenToUpcomingEvents(callback) {
    const eventsRef = ref(rtdb, 'events');
    onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        let events = [];
        if (data) {
            Object.keys(data).forEach(key => { events.push({ id: key, ...data[key] }); });
        }
        const now = new Date();
        const activeEvents = events.map(e => ({
            ...e,
            startObj: new Date(e.datetime),
            endObj: e.endtime ? new Date(e.endtime) : new Date(new Date(e.datetime).getTime() + 3*60*60*1000)
        })).filter(e => e.endObj >= now).sort((a, b) => a.startObj - b.startObj);
        
        callback(activeEvents);
    });
}

export async function getAdminEvents() {
    const snapshot = await get(ref(rtdb, 'events'));
    const data = snapshot.val();
    let events = [];
    if (data) { Object.keys(data).forEach(key => { events.push({ id: key, ...data[key] }); }); }
    return events;
}

export function saveEventToCloud(eventData) { 
    return set(ref(rtdb, 'events/' + eventData.id), eventData); 
}

export function deleteEventFromCloud(id) { 
    return remove(ref(rtdb, 'events/' + id)); 
}

export async function getPhotos() {
    const snapshot = await get(ref(rtdb, 'photos'));
    const data = snapshot.val();
    let photos = [];
    if (data) { Object.keys(data).forEach(key => { photos.push({ id: key, ...data[key] }); }); }
    return photos;
}

export function savePhotoToCloud(photoData) { 
    return set(ref(rtdb, 'photos/' + photoData.id), photoData); 
}

export function deletePhotoFromCloud(id) { 
    return remove(ref(rtdb, 'photos/' + id)); 
}

export function getGoogleCalendarUrl(ev) {
    const s = new Date(ev.datetime); 
    const e = ev.endtime ? new Date(ev.endtime) : new Date(s.getTime() + 3 * 60 * 60 * 1000);
    const f = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`AlvadtVér - ${ev.title}`)}&dates=${f(s)}/${f(e)}&details=${encodeURIComponent(ev.location)}&location=${encodeURIComponent(ev.location)}`;
}

export function getGoogleMapsUrl(loc) { 
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`; 
}