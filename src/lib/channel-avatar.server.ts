export async function channelAvatar(platform: string, handle: string): Promise<string> {
  try {
    const url = platform === 'kick' ? `https://kick.com/api/v2/channels/${encodeURIComponent(handle)}` : `https://www.youtube.com/@${encodeURIComponent(handle)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) { console.error('Channel lookup failed', response.status); return ''; }
    let image = '';
    if (platform === 'kick') { const data = await response.json() as { user?: { profile_pic?: string } }; image = data.user?.profile_pic ?? ''; }
    else {
      const html = await response.text();
      image = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&') ?? '';
    }
    const parsed = new URL(image);
    return parsed.protocol === 'https:' ? image : '';
  } catch { return ''; }
}