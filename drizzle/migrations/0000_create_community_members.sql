CREATE TABLE public.community_members (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK (kind IN ('streamer','staff')), name text NOT NULL, platform text CHECK (platform IN ('kick','youtube')), channel text NOT NULL DEFAULT '', url text NOT NULL DEFAULT '', avatar_url text NOT NULL DEFAULT '', role text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.community_members TO anon, authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public community directory" ON public.community_members FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX community_members_kind_created ON public.community_members(kind, created_at);
INSERT INTO public.community_members (kind, name, platform, channel, url, avatar_url, role) VALUES
('streamer','Streamer1','kick','streamer1','https://kick.com','',''),
('streamer','Streamer2','kick','streamer2','https://kick.com','',''),
('streamer','Streamer3','kick','streamer3','https://kick.com','',''),
('streamer','Streamer4','kick','streamer4','https://kick.com','',''),
('streamer','Streamer5','kick','streamer5','https://kick.com','',''),
('streamer','Streamer6','youtube','streamer6','https://youtube.com','',''),
('streamer','Streamer7','youtube','streamer7','https://youtube.com','',''),
('streamer','Streamer8','youtube','streamer8','https://youtube.com','',''),
('streamer','Streamer9','youtube','streamer9','https://youtube.com','',''),
('streamer','Streamer10','youtube','streamer10','https://youtube.com','',''),
('staff','Owner',NULL,'','','','Founder'),
('staff','Admin1',NULL,'','','','Admin'),
('staff','Mod1',NULL,'','','','Moderator'),
('staff','Mod2',NULL,'','','','Moderator');