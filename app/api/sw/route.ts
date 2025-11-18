export function GET() {
    const sw = `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('sync', async (event) => {
  if (event.tag === 'flush-ride-queue') {
    const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
    clientsArr.forEach(c => c.postMessage({ type: 'SYNC_REQUEST' }));
  }
});`;
    return new Response(sw, { 
        headers: { 
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=31536000, immutable"
        } 
    });
}
