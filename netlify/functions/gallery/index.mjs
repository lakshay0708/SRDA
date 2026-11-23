import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { managerPage } from './manager-page.mjs';

export const config = {
  path: ['/api/gallery', '/gallery-images/:id', '/manage-photos', '/manage-photos/', '/manage-photos/api', '/manage-photos/api/:id'],
};

const maxBytes = 4 * 1024 * 1024;
const prefix = 'photos/';
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const securityHeaders = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex',
};
const pagePolicy = "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'";

function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { ...securityHeaders, ...headers } });
}

function hasOwnerAccess(request, password) {
  const authorization = request.headers.get('Authorization');
  const credentials = authorization?.match(/^Basic ([A-Za-z0-9+/]+={0,2})$/i);
  if (!credentials) return false;
  const supplied = Buffer.from(credentials[1], 'base64');
  const hash = (value) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(supplied), hash('owner:' + password));
}

function imageType(bytes) {
  const matches = (offset, prefixBytes) => prefixBytes.every((byte, index) => bytes[offset + index] === byte);
  if (matches(0, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (matches(0, [137, 80, 78, 71, 13, 10, 26, 10])) return 'image/png';
  if (matches(0, [82, 73, 70, 70]) && matches(8, [87, 69, 66, 80])) return 'image/webp';
  return null;
}

export function createGalleryHandler(getPhotoStore, getPassword) {
  return async function gallery(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const isManager = path === '/manage-photos' || path === '/manage-photos/';
    const isAdminApi = path === '/manage-photos/api' || path.startsWith('/manage-photos/api/');

    if (isManager || isAdminApi) {
      if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
        return json({ error: 'Use HTTPS to manage photos.' }, 403);
      }
      if (path === '/manage-photos' && (method === 'GET' || method === 'HEAD')) {
        return new Response(null, { status: 308, headers: { ...securityHeaders, Location: '/manage-photos/' } });
      }
      const password = getPassword();
      if (!password || password.length < 24) {
        return json({ error: 'Set a strong GALLERY_ADMIN_PASSWORD in Netlify before managing photos.' }, 503);
      }
      if (!hasOwnerAccess(request, password)) {
        return json({ error: 'Sign in with the owner credentials to manage photos.' }, 401, {
          'WWW-Authenticate': 'Basic realm="SRDA photo manager", charset="UTF-8"',
        });
      }
      if (isManager && (method === 'GET' || method === 'HEAD')) {
        return new Response(method === 'GET' ? managerPage : null, {
          headers: { ...securityHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': pagePolicy },
        });
      }
      if (!['GET', 'HEAD'].includes(method) && request.headers.get('Origin') !== url.origin) {
        return json({ error: 'Open the photo manager directly on this site.' }, 403);
      }
    }

    const item = path.match(/^\/(gallery-images|manage-photos\/api)\/([\da-f-]{36})$/i);
    try {
      if (method === 'GET' && ['/api/gallery', '/manage-photos/api'].includes(path)) {
        const store = getPhotoStore();
        const { blobs } = await store.list({ prefix });
        const photos = [];
        for (let offset = 0; offset < blobs.length; offset += 12) {
          const batch = await Promise.all(blobs.slice(offset, offset + 12).map(async ({ key }) => {
            const entry = await store.getMetadata(key);
            if (!entry) return null;
            return { id: key.slice(prefix.length), caption: entry.metadata.caption ?? '', uploaded: entry.metadata.uploaded ?? '' };
          }));
          photos.push(...batch.filter(Boolean));
        }
        photos.sort((a, b) => b.uploaded.localeCompare(a.uploaded));
        return json({ photos, canManage: isAdminApi });
      }

      if (method === 'POST' && path === '/manage-photos/api') {
        let caption;
        try {
          caption = decodeURIComponent(request.headers.get('X-Photo-Caption') ?? '').trim();
        } catch {
          return json({ error: 'Enter a valid caption.' }, 400);
        }
        if (caption.length > 120) return json({ error: 'Use a caption up to 120 characters.' }, 400);
        if (Number(request.headers.get('Content-Length')) > maxBytes) return json({ error: 'Choose a photo up to 4 MB.' }, 413);
        const data = await request.arrayBuffer();
        if (data.byteLength > maxBytes) return json({ error: 'Choose a photo up to 4 MB.' }, 413);
        const type = imageType(new Uint8Array(data));
        if (!type) return json({ error: 'Choose a JPG, PNG, or WebP image.' }, 415);

        const id = randomUUID();
        await getPhotoStore().set(prefix + id, data, { metadata: { type, caption, uploaded: new Date().toISOString() } });
        return json({ id, caption }, 201);
      }

      if (item?.[1] === 'gallery-images' && method === 'GET') {
        const entry = await getPhotoStore().getWithMetadata(prefix + item[2], { type: 'arrayBuffer' });
        if (!entry || !imageTypes.has(entry.metadata.type)) return json({ error: 'Photo not found.' }, 404);
        return new Response(entry.data, {
          headers: { ...securityHeaders, 'Content-Type': entry.metadata.type, 'Content-Security-Policy': "default-src 'none'; sandbox" },
        });
      }
      if (item?.[1] === 'manage-photos/api' && method === 'DELETE') {
        await getPhotoStore().delete(prefix + item[2]);
        return json({ ok: true });
      }
      return json({ error: 'Route or method unavailable.' }, 404);
    } catch (error) {
      console.error('Gallery operation failed:', error.name);
      return json({ error: 'The photo gallery is temporarily unavailable.' }, 503);
    }
  };
}

export default createGalleryHandler(
  () => getStore({ name: 'srda-office-photos', consistency: 'strong' }),
  () => process.env.GALLERY_ADMIN_PASSWORD,
);
