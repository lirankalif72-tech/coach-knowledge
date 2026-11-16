// להעלות את המספר בכל עדכון של האפליקציה, כדי שהמשתמשים יקבלו את הגרסה החדשה
const CACHE = 'coach-knowledge-v16';
const FILES = [
  './', './index.html', './styles.css', './app.js',
  './questions.js', './questions2.js', './questions3.js', './questions4.js', './questions5.js', './facts.js', './lessons.js', './foods.js', './config.js', './duel.js', './fundata.js', './fun.js', './lib/peerjs.min.js',
  './privacy.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];
try { importScripts('./facts.js'); } catch (e) { self.FACTS = []; }

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'ck-meta').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// רשת קודם (כדי לקבל עדכונים), ובלי חיבור – מהמטמון
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});

// ── תזכורות כשהאפליקציה סגורה (Periodic Background Sync – הטלפון קובע את התדירות בפועל) ──
function inQuiet(cfg, d) {
  const toMin = t => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
  const m = d.getHours() * 60 + d.getMinutes(), a = toMin(cfg.quietFrom), b = toMin(cfg.quietTo);
  if (a === b) return false;
  return a < b ? (m >= a && m < b) : (m >= a || m < b);
}
async function maybeRemind() {
  const meta = await caches.open('ck-meta');
  const res = await meta.match('./__reminder.json');
  if (!res) return;
  const cfg = await res.json();
  const now = Date.now();
  if (!cfg.on || inQuiet(cfg, new Date())) return;
  if (now - (cfg.last || 0) < Math.max(cfg.every, 30) * 60000) return;
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.some(c => c.visibilityState === 'visible')) return;
  let body = cfg.streak >= 2 ? `רצף של ${cfg.streak} ימים – לא לשבור אותו! 🔥` : 'כמה דקות של שאלות – ועוד צעד למדריך מקצועי 💪';
  if (cfg.fact && self.FACTS && FACTS.length) body = '💡 הידעת? ' + FACTS[Math.floor(Math.random() * FACTS.length)].t + '\n' + body;
  await self.registration.showNotification('מאמן ידע – זמן לתרגל 💪', { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'ck-reminder', data: { url: './?mode=quick' } });
  cfg.last = now;
  await meta.put('./__reminder.json', new Response(JSON.stringify(cfg)));
}
self.addEventListener('periodicsync', e => { if (e.tag === 'ck-reminder') e.waitUntil(maybeRemind()); });

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
