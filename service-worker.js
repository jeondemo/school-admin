// ============================================================
//  🚌 스쿨버스 관리 PWA Service Worker
//  배포 시 CACHE_NAME 의 버전 숫자만 올리면 캐시 무효화됨
// ============================================================
const CACHE_NAME = "school-admin-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

// 설치 시 정적 파일 캐시
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// 요청 처리
//  - GAS API 호출(.googleusercontent / script.google.com)은 항상 네트워크
//  - 정적 자원만 캐시 우선
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // API 호출은 캐시 안 함
  if (url.includes("script.google.com") || url.includes("googleusercontent.com")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 정적 자원: 캐시 우선, 실패 시 네트워크
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // 캐시할 만한 응답만 저장
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
