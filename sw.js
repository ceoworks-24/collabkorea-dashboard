// 앱 설치 + 폰 알림용 서비스워커: 항상 최신 화면을 먼저 받고, 오프라인일 때만 저장본을 보여줍니다.
const C = 'collabkorea-v4';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r)));
});
// 폰 알림 수신: 서버가 보낸 제목·내용을 그대로 상단 알림으로 보여줍니다.
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { }
  const x = d.data || d.notification || d || {};
  const title = x.title || '㈜콜라브코리아';
  e.waitUntil((async () => {
    await self.registration.showNotification(title, { body: x.body || '', icon: 'icon-192.png', badge: 'badge-v2.png', tag: x.tag || undefined, data: { tab: x.tab || '' } });
    try { const n = (await self.registration.getNotifications()).length; if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n || 1); } catch (_) { }
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const tab = (e.notification.data && e.notification.data.tab) || '';
  const url = new URL('./' + (tab ? '?tab=' + tab : ''), self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { if ('focus' in c) { try { await c.focus(); if ('navigate' in c) await c.navigate(url); } catch (_) { } return; } }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
