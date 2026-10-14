// 앱 설치용 서비스워커: 항상 최신 화면을 먼저 받고, 오프라인일 때만 저장본을 보여줍니다.
const C = 'collabkorea-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r)));
});
