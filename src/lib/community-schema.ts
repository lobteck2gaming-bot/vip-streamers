import { z } from 'zod';
export const memberSchema = z.object({
  id: z.string().uuid().optional(), kind: z.enum(['streamer', 'staff']),
  name: z.string().trim().min(1).max(100), platform: z.enum(['kick', 'youtube']).nullable(),
  channel: z.string().trim().max(100), url: z.string().max(2000),
  avatar_url: z.string().max(2000), role: z.string().trim().max(100),
  badge: z.enum(['partner', 'verified', 'none']).default('none'),
}).refine(v => v.kind !== 'streamer' || v.platform !== null, 'Choose a platform')
  .refine(v => !v.avatar_url || v.avatar_url.startsWith('storage:') || /^https:\/\//.test(v.avatar_url), 'Use an HTTPS image URL');
export type MemberInput = z.infer<typeof memberSchema>;
export type Member = MemberInput & { id: string };