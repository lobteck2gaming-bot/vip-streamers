import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { memberSchema } from './community-schema';

const signedUrlCache = new Map<string, { url: string; exp: number }>();


export const getCommunity = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Community connection unavailable');
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_')) headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  } } });
  // Page through the directory; there is no application member-count cap.
  const members: import('./community-schema').Member[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from('community_members').select('id,kind,name,platform,channel,url,avatar_url,role,badge').order('created_at').order('id').range(offset, offset + 999);
    if (error) throw new Error(error.message);
    members.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const stored = members.filter(m => m.avatar_url.startsWith('storage:'));
  if (stored.length) {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const browserUrl = import.meta.env['VITE_SUPABASE_URL'];
    for (const member of stored) {
      const path = member.avatar_url.slice(8);
      if (!/^avatars\/[a-f0-9-]+\.(png|jpg|webp)$/.test(path)) { member.avatar_url = ''; continue; }
      // Reuse the same signed URL within its lifetime so SSR markup matches the client refetch.
      const cached = signedUrlCache.get(path);
      if (cached && cached.exp > Date.now()) { member.avatar_url = cached.url; continue; }
      const { data } = await supabaseAdmin.storage.from('community-avatars').createSignedUrl(path, 3600);
      member.avatar_url = data ? data.signedUrl.replace(url, browserUrl) : '';
      if (member.avatar_url) signedUrlCache.set(path, { url: member.avatar_url, exp: Date.now() + 3500_000 });
    }
  }
  return members;
});
export const adminStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const { adminSession } = await import('./admin-security.server');
  return { unlocked: Boolean((await adminSession()).data.unlocked) };
});
export const unlockAdmin = createServerFn({ method: 'POST' }).inputValidator(z.object({ password: z.string().max(256) })).handler(async ({ data }) => {
  const { adminSession, passwordMatches } = await import('./admin-security.server');
  const expected = process.env['SITE_PASSWORD'];
  if (!expected) throw new Error('Admin password is not configured');
  if (!passwordMatches(data.password, expected)) return { ok: false };
  await (await adminSession()).update({ unlocked: true });
  return { ok: true };
});
export const lockAdmin = createServerFn({ method: 'POST' }).handler(async () => {
  const { adminSession } = await import('./admin-security.server');
  await (await adminSession()).clear();
  return { ok: true };
});
export const saveMember = createServerFn({ method: 'POST' }).inputValidator(memberSchema).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server');
  await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const row = { ...data };
  // Badges are a Kick-only concept; YouTube streamers and staff stay normal.
  if (row.platform !== 'kick') row.badge = 'none';
  if (row.kind === 'streamer' && row.channel) {
    const handle = row.channel.replace(/^@/, '');
    if (!/^[\p{L}\p{N}_.-]+$/u.test(handle)) throw new Error('Enter a channel username, not a URL');
    row.url = row.platform === 'kick' ? `https://kick.com/${encodeURIComponent(handle)}` : `https://www.youtube.com/@${encodeURIComponent(handle)}`;
    const { channelAvatar } = await import('./channel-avatar.server');
    const avatar = await channelAvatar(row.platform ?? '', handle);
    if (avatar) row.avatar_url = avatar;
  }
  const { id, ...fields } = row;
  const { error } = id ? await supabaseAdmin.from('community_members').update({ id, ...fields }).eq('id', id) : await supabaseAdmin.from('community_members').insert(fields);
  if (error) throw new Error(error.message);
  return { ok: true, avatarFound: Boolean(row.avatar_url) };
});
export const adminMembers = createServerFn({ method: 'GET' }).handler(async () => {
  const { requireAdmin } = await import('./admin-security.server'); await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const rows: import('./community-schema').Member[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabaseAdmin.from('community_members').select('id,kind,name,platform,channel,url,avatar_url,role,badge').order('created_at').order('id').range(offset, offset + 999);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as import('./community-schema').Member[])); if (!data || data.length < 1000) break;
  }
  return rows;
});
export const deleteMember = createServerFn({ method: 'POST' }).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server');
  await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('community_members').delete().eq('id', data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
});
export const uploadAvatar = createServerFn({ method: 'POST' }).inputValidator(z.object({ base64: z.string().max(7000000), type: z.enum(['image/png', 'image/jpeg', 'image/webp']) })).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server');
  await requireAdmin();
  const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
  if (bytes.length > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5 MB');
  const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78;
  const jpg = bytes[0] === 255 && bytes[1] === 216;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!(data.type === 'image/png' ? png : data.type === 'image/jpeg' ? jpg : webp)) throw new Error('Invalid image');
  const ext = data.type === 'image/png' ? 'png' : data.type === 'image/jpeg' ? 'jpg' : 'webp';
  const path = `avatars/${crypto.randomUUID()}.${ext}`;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.storage.from('community-avatars').upload(path, bytes, { contentType: data.type });
  if (error) throw new Error(error.message);
  return { url: `storage:${path}` };
});