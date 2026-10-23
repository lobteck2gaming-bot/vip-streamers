import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminStatus, unlockAdmin, lockAdmin, adminMembers, saveMember, deleteMember, uploadAvatar } from '@/lib/community.functions';
import type { Member, MemberInput } from '@/lib/community-schema';

export const Route = createFileRoute('/admin')({
  loader: () => adminStatus(),
  head: () => ({ meta: [{ title: 'Admin panel — VIP Streamers' }, { name: 'description', content: 'Manage the VIP Streamers community directory.' }, { property: 'og:title', content: 'VIP Streamers Admin panel' }, { property: 'og:description', content: 'Community directory management.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: Admin,
});
const empty = (kind: 'streamer' | 'staff'): MemberInput => ({ kind, name: '', platform: kind === 'streamer' ? 'kick' : null, channel: '', url: '', avatar_url: '', role: '', badge: 'none' });
const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-foreground';
function Admin() {
  const initial = Route.useLoaderData();
  const [unlocked, setUnlocked] = useState(initial.unlocked);
  const [rows, setRows] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [kind, setKind] = useState<'streamer' | 'staff'>('streamer');
  const [draft, setDraft] = useState<MemberInput | null>(null);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const unlock = useServerFn(unlockAdmin), lock = useServerFn(lockAdmin), list = useServerFn(adminMembers);
  const save = useServerFn(saveMember), remove = useServerFn(deleteMember), upload = useServerFn(uploadAvatar);
  const queryClient = useQueryClient();
  async function refresh() { setRows(await list()); setLoaded(true); await queryClient.invalidateQueries({ queryKey: ['community'] }); }
  async function action(fn: () => Promise<void>) { setBusy(true); setError(''); setNotice(''); try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); } finally { setBusy(false); } }
  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4"><Button asChild variant="ghost"><Link to="/"><ArrowLeft />VIP × KR</Link></Button><h1 className="font-display text-xl text-primary">Admin panel</h1>{unlocked && <Button variant="outline" onClick={() => action(async () => { await lock(); setUnlocked(false); setRows([]); setLoaded(false); setDraft(null); })}><LogOut />Sign out</Button>}</header>
    {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}{notice && <p role="status" className="mb-4 text-primary">{notice}</p>}
    {!unlocked ? <form className="mx-auto max-w-sm space-y-5" onSubmit={e => { e.preventDefault(); const password = String(new FormData(e.currentTarget).get('password') ?? ''); action(async () => { const result = await unlock({ data: { password } }); if (!result.ok) { setError('Incorrect password'); return; } setUnlocked(true); await refresh(); }); }}>
      <h2 className="font-display text-2xl">Admin access</h2><label className="block">Password<input name="password" type="password" autoComplete="current-password" required className={`${inputClass} mt-2`} /></label><Button disabled={busy} type="submit">{busy ? 'Checking…' : 'Enter'}</Button>
    </form> : <>
      {!loaded ? <Button disabled={busy} onClick={() => action(refresh)}>Load members</Button> : <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2">{(['streamer', 'staff'] as const).map(k => <Button key={k} variant={kind === k ? 'default' : 'outline'} onClick={() => { setKind(k); setDraft(null); }}>{k === 'streamer' ? 'Streamers' : 'Staff'}</Button>)}</div><Button onClick={() => setDraft(empty(kind))}><Plus />Add {kind}</Button></div>
        {draft && <form className="mb-8 grid gap-4 border-y py-6 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); action(async () => { const result = await save({ data: draft }); setDraft(null); await refresh(); setNotice(draft.kind === 'streamer' && draft.channel && !result.avatarFound ? 'Saved. Channel avatar unavailable; add an image URL.' : 'Saved'); }); }}>
          <label>Name<input aria-label="Name" required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputClass} /></label>
          {draft.kind === 'streamer' ? <><label>Platform<select className={inputClass} value={draft.platform ?? 'kick'} onChange={e => setDraft({ ...draft, platform: e.target.value === 'kick' ? 'kick' : 'youtube', badge: e.target.value === 'kick' ? draft.badge : 'none' })}><option value="kick">Kick</option><option value="youtube">YouTube</option></select></label><label>Channel username<input value={draft.channel} onChange={e => setDraft({ ...draft, channel: e.target.value })} className={inputClass} placeholder="@username" /></label>{draft.platform === 'kick' && <label>Kick badge<select className={inputClass} value={draft.badge} onChange={e => setDraft({ ...draft, badge: e.target.value as MemberInput['badge'] })}><option value="none">Just starting (no badge)</option><option value="verified">Verified (green)</option><option value="partner">Partner (blue)</option></select></label>}</> : <label>Role<input value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })} className={inputClass} /></label>}
          <label>Image URL<input value={draft.avatar_url.startsWith('storage:') ? '' : draft.avatar_url} onChange={e => setDraft({ ...draft, avatar_url: e.target.value })} type="url" className={inputClass} placeholder="https://…" /></label>
          <label className="flex items-center gap-2"><Upload className="h-4 w-4" />Upload image<input aria-label="Upload image" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="min-w-0 max-w-full text-sm" onChange={e => { const file = e.target.files?.[0]; if (!file) return; action(async () => { if (file.size > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5 MB'); if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/webp') throw new Error('Choose PNG, JPEG or WebP'); const reader = new FileReader(); const base64 = await new Promise<string>((resolve, reject) => { reader.onload = () => resolve(String(reader.result).split(',')[1] ?? ''); reader.onerror = reject; reader.readAsDataURL(file); }); const result = await upload({ data: { base64, type: file.type } }); setDraft({ ...draft, avatar_url: result.url }); setNotice('Image uploaded'); }); }} /></label>
          <div className="flex gap-3 sm:col-span-2"><Button type="submit" disabled={busy}><Save />{busy ? 'Saving…' : 'Save'}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setDraft(null)}>Cancel</Button></div>
        </form>}
        <div className="divide-y border-y">{rows.filter(r => r.kind === kind).map(row => <div key={row.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><div className="break-words text-lg font-bold">{row.name}</div><div className="text-sm text-muted-foreground">{row.platform ?? row.role}{row.channel && ` · ${row.channel}`}</div></div><div className="flex shrink-0 gap-2"><Button variant="outline" size="icon" title={`Edit ${row.name}`} aria-label={`Edit ${row.name}`} onClick={() => setDraft(row)}><Pencil /></Button><Button variant="ghost" size="icon" disabled={busy} title={`Delete ${row.name}`} aria-label={`Delete ${row.name}`} onClick={() => { if (window.confirm(`Delete ${row.name}?`)) action(async () => { await remove({ data: { id: row.id } }); await refresh(); }); }}><Trash2 /></Button></div></div>)}</div>
        {!rows.some(r => r.kind === kind) && <p className="py-8 text-muted-foreground">No members yet.</p>}
      </>}
    </>}
  </main>;
}