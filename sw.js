// Service Worker — Moje Financije
const CACHE = 'moje-financije-v1';
const OFFLINE = ['/', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Za Google API pozive — uvijek mreža
  if(e.request.url.includes('googleapis.com') ||
     e.request.url.includes('accounts.google.com') ||
     e.request.url.includes('fonts.googleapis.com')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Cache HTML i statične resurse
        if(resp.ok && ['navigate','style','script','image'].includes(e.request.destination)){
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
