import { describe, expect, it } from 'vitest';
import { discord } from '@/data/community';
import { memberSchema } from '@/lib/community-schema';
import { passwordMatches } from '@/lib/admin-security.server';
describe('Community requirements', () => {
  it('uses the KR invitation', () => expect(discord.kr).toBe('https://discord.gg/GQfPawe7pf'));
  it('uses the VIP invitation', () => expect(discord.vip).toBe('https://discord.gg/8WKV2pETaH'));
  it('rejects a wrong shared password', () => expect(passwordMatches('wrong', 'test-admin-secret')).toBe(false));
  it('accepts a matching shared password', () => expect(passwordMatches('test-admin-secret', 'test-admin-secret')).toBe(true));
  it('requires a streamer platform', () => expect(memberSchema.safeParse({ kind: 'streamer', name: 'Test', platform: null, channel: '', url: '', avatar_url: '', role: '' }).success).toBe(false));
});