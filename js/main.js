var countdownInterval = null;
var latestEventsCache = [];

window.refreshMainEvents = function() {
    if (latestEventsCache.length > 0) renderEvents(latestEventsCache);
};

function renderEvents(events) {
    latestEventsCache = events;
    const container = document.getElementById('events-display');
    const lang = typeof window.getLang === 'function' ? window.getLang() : 'hu';
    const dict = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {
        no_concerts: "Jelenleg nincsenek rögzített koncertek.",
        live_badge: "ÉLŐBEN!",
        next_gig: "Következő Koncert",
        days: "Nap",
        hours: "Óra",
        mins: "Perc",
        secs: "Mp",
        btn_map: "Helyszín (Google Maps)",
        btn_calendar: "Mentés Naptárba"
    };
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

// Banda tagok dinamikus betöltése Firebase-ből
document.addEventListener('DOMContentLoaded', () => {
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
                    <img src="${imgUrl}" alt="${member.name}" onerror="this.src='logo.png'">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
});