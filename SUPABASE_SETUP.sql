-- Run this ONCE in your Supabase project: SQL Editor -> New query -> paste -> Run
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('streamer','staff')),
  name text NOT NULL,
  platform text CHECK (platform IN ('kick','youtube')),
  channel text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT 'none' CHECK (badge IN ('partner','verified','none')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_members TO anon, authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public community directory" ON public.community_members;
CREATE POLICY "Public community directory" ON public.community_members FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS community_members_kind_created ON public.community_members(kind, created_at);

-- Private bucket for uploaded avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('community-avatars', 'community-avatars', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Starter rows (replace them from the Admin panel)
INSERT INTO public.community_members (kind, name, platform, channel, url, role) VALUES
('streamer','Streamer1','kick','streamer1','https://kick.com/streamer1',''),
('streamer','Streamer6','youtube','streamer6','https://www.youtube.com/@streamer6',''),
('staff','Owner',NULL,'','','Founder');
