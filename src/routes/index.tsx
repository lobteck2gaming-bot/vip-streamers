import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from '@tanstack/react-query';
import { communityQuery } from '@/lib/community-query';
import { MemberAvatar } from '@/components/MemberAvatar';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from "react";
import vipImg from "@/assets/vip.png";
import krImg from "@/assets/kr.png";
import badgePartner from "@/assets/badge-partner.png";
import badgeVerified from "@/assets/badge-verified.png";
const vip = { url: vipImg };
const kr = { url: krImg };
import { Globe } from "@/components/Globe";
import { KickLogo, YouTubeLogo, DiscordLogo } from "@/components/PlatformIcons";
import { rules, discord } from "@/data/community";
import type { Member } from '@/lib/community-schema';

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(communityQuery),
  head: () => ({
    meta: [
      { title: "VIP Streamers — Kick & YouTube Support Community" },
      { name: "description", content: "VIP Streamers x KR Community: support Kick and YouTube streamers, meet the staff and join our Discord." },
      { property: "og:title", content: "VIP Streamers — Kick & YouTube Support" },
      { property: "og:description", content: "Support Kick and YouTube streamers with VIP Streamers and KR Community." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Index,
});

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: (i * 37.3) % 100, y: (i * 61.7) % 100, s: 1 + (i % 3), d: (i % 7) * 0.45, gold: i % 4 === 0,
}));
const DUST = Array.from({ length: 24 }, (_, i) => ({ x: (i * 43.1) % 100, d: (i % 6) * 2, t: 12 + (i % 5) * 3 }));

function StarField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((st, i) => (
        <span key={i} className={`absolute rounded-full animate-twinkle ${st.gold ? "bg-primary" : "bg-foreground"}`}
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
      ))}
      {DUST.map((p, i) => (
        <span key={`d${i}`} className="absolute top-full h-1 w-1 rounded-full bg-primary/60 blur-[1px] animate-drift"
          style={{ left: `${p.x}%`, animationDuration: `${p.t}s`, animationDelay: `${p.d}s` }} />
      ))}
      {[0, 2, 4].map((d) => (
        <span key={`s${d}`} className="absolute h-px w-32 bg-gradient-to-l from-transparent via-primary to-foreground animate-shoot"
          style={{ top: `${10 + d * 6}%`, left: `${70 + d * 6}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

function Intro({ onEnter, streamers }: { onEnter: () => void; streamers: Member[] }) {
  useEffect(() => {
    const k = () => onEnter();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onEnter]);
  const kick = streamers.filter((s) => s.platform === "kick");
  const yt = streamers.filter((s) => s.platform === "youtube");
  return (
    <div onClick={onEnter} className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-background">
      <StarField />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 animate-scan bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-3">
        <div className="animate-slide-l flex flex-col items-center gap-4">
          <KickLogo className="h-20 w-20 text-kick drop-shadow-[0_0_20px_var(--kick)]" />
          <div className="font-display text-2xl font-bold text-kick">KICK</div>
          <div className="flex flex-wrap justify-center gap-2">
            {kick.map((s) => <span key={s.name} className="rounded-full border border-kick/40 px-3 py-1 text-sm text-kick">{s.name}</span>)}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative animate-intro-zoom">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-3xl animate-logo-glow" />
            <img src={vip.url} alt="VIP Streamers" className="relative w-64 animate-logo-float drop-shadow-[0_0_25px_var(--primary)] md:w-80" />
          </div>
        </div>
        <div className="animate-slide-r flex flex-col items-center gap-4">
          <YouTubeLogo className="h-20 w-20 text-youtube drop-shadow-[0_0_20px_var(--youtube)]" />
          <div className="font-display text-2xl font-bold text-youtube">YOUTUBE</div>
          <div className="flex flex-wrap justify-center gap-2">
            {yt.map((s) => <span key={s.name} className="rounded-full border border-youtube/40 px-3 py-1 text-sm text-youtube">{s.name}</span>)}
          </div>
        </div>
      </div>
      <p className="mt-14 animate-blink font-display text-sm tracking-[0.4em] text-primary">PRESS ANY KEY OR CLICK TO ENTER</p>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-12 text-center font-display text-4xl font-black text-gold-gradient md:text-5xl">{title}</h2>
      {children}
    </section>
  );
}

const BADGES = {
  partner: { img: badgePartner, label: "Partner" },
  verified: { img: badgeVerified, label: "Verified" },
} as const;

function StreamerCard({ s, p }: { s: Member; p: "kick" | "youtube" }) {
  const badge = s.badge !== "none" ? BADGES[s.badge] : null;
  return (
    <a href={s.url} target="_blank" rel="noreferrer"
      className={`group rounded-xl border bg-card p-5 text-center transition hover:-translate-y-1 ${p === "kick" ? "hover:border-kick" : "hover:border-youtube"}`}>
      <div className="relative mx-auto mb-3 h-16 w-16">
        <MemberAvatar url={s.avatar_url} name={s.name} className={`h-full w-full text-xl font-bold ${p === "kick" ? "bg-kick/15 text-kick" : "bg-youtube/15 text-youtube"}`} />
        {badge && (
          <img src={badge.img} alt={badge.label} title={badge.label} loading="lazy" width={816} height={816}
            className="absolute -bottom-1 -right-1 h-6 w-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
        )}
      </div>
      <div className="break-words font-semibold">{s.name}</div>
      <div className="text-xs text-muted-foreground">Watch live →</div>
    </a>
  );
}

function Index() {
  const { data: members } = useSuspenseQuery(communityQuery);
  const streamers = members.filter(m => m.kind === 'streamer');
  const staff = members.filter(m => m.kind === 'staff');
  const [entered, setEntered] = useState(false);
  const [fade, setFade] = useState(false);
  const enter = () => {
    if (fade) return;
    setFade(true);
    setTimeout(() => setEntered(true), 600);
  };

  return (
    <>
      {!entered && (
        <div className={`transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}>
          <Intro onEnter={enter} streamers={streamers} />
        </div>
      )}
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <img src={vip.url} alt="" className="h-10 w-10" />
            <span className="font-display text-sm font-bold text-primary">VIP × KR</span>
          </div>
          <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 font-semibold text-muted-foreground md:gap-6">
            {[["streamers", "Streamers"], ["staff", "Staff"], ["rules", "Rules"], ["discord", "Discord"]].map(([h, l]) => (
              <a key={h} href={`#${h}`} className="transition-colors hover:text-primary">{l}</a>
            ))}
            <Button asChild variant="link" className="h-auto p-0"><Link to="/admin">Admin panel</Link></Button>
          </div>
        </nav>
      </header>

      <section className="relative pb-12">
        <div className="h-[min(65vh,650px)] min-h-[320px]">{entered && <Globe streamers={streamers} />}</div>
        <div className="px-4 text-center">
          <h1 className="font-display text-3xl font-black text-gold-gradient md:text-6xl">VIP STREAMERS</h1>
          <p className="mt-2 text-lg text-muted-foreground">Support Kick & YouTube streamers — ma3a KR Community</p>
          <div aria-hidden="true" className="pointer-events-none mt-6 flex select-none flex-col items-center gap-2 text-sm tracking-widest text-primary animate-scroll-bounce">
            <span className="animate-scroll-glow">SCROLL</span>
            <span className="flex h-10 w-6 justify-center rounded-full border-2 border-primary/70 pt-1.5">
              <span className="h-2 w-1 rounded-full bg-primary animate-scroll-dot" />
            </span>
            <span className="text-lg leading-none">↓</span>
          </div>
        </div>
      </section>

      <Section id="streamers" title="OUR STREAMERS">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
        {(["kick", "youtube"] as const).map((p) => {
          const list = streamers.filter((s) => s.platform === p);
          const groups = (p === "kick"
            ? [
                { key: "partner", label: "PARTNER", cls: "text-partner", img: badgePartner, items: list.filter((s) => s.badge === "partner") },
                { key: "verified", label: "VERIFIED", cls: "text-verified", img: badgeVerified, items: list.filter((s) => s.badge === "verified") },
                { key: "none", label: "JUST STARTING", cls: "text-muted-foreground", img: null, items: list.filter((s) => s.badge === "none") },
              ]
            : [{ key: "all", label: "", cls: "", img: null, items: list }]
          ).filter((g) => g.items.length > 0);
          return (
            <div key={p} className={`min-w-0 ${p === 'youtube' ? 'border-l pl-4 md:pl-8' : ''}`}>
              <div className={`mb-5 flex items-center gap-3 font-display text-xl font-bold ${p === "kick" ? "text-kick" : "text-youtube"}`}>
                {p === "kick" ? <KickLogo className="h-7 w-7" /> : <YouTubeLogo className="h-7 w-7" />}
                {p === "kick" ? "KICK" : "YOUTUBE"}
              </div>
              <div className="flex flex-col gap-7">
                {groups.map((g) => (
                  <div key={g.key}>
                    {g.label && (
                      <div className={`mb-3 flex items-center gap-2 font-display text-sm font-bold tracking-widest ${g.cls}`}>
                        {g.img && <img src={g.img} alt="" loading="lazy" width={816} height={816} className="h-5 w-5" />}
                        {g.label}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {g.items.map((s) => <StreamerCard key={s.name} s={s} p={p} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </Section>

      <Section id="staff" title="STAFF">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {staff.map((m) => (
            <div key={m.id} tabIndex={0} className="hover-zoom rounded-xl border bg-card p-6 text-center glow-gold">
              <MemberAvatar url={m.avatar_url} name={m.name} className="mx-auto mb-3 h-20 w-20 border-2 border-primary text-2xl text-primary" />
              <div className="text-lg font-bold">{m.name}</div>
              <div className="text-sm font-semibold uppercase tracking-wider text-accent">{m.role}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rules" title="COMMUNITY RULES">
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((r, i) => (
            <div key={r.t} tabIndex={0} className="hover-zoom flex gap-4 rounded-xl border bg-card p-5">
              <span className="font-display text-3xl font-black text-primary/60">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="text-lg font-bold text-primary">{r.t}</div>
                <p className="text-muted-foreground">{r.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="discord" title="JOIN OUR DISCORD">
        <div className="grid gap-6 md:grid-cols-2">
          <VipDiscordCard />
          <a href={discord.kr} target="_blank" rel="noreferrer"
            className="flex items-center gap-6 rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:border-kr">
            <img src={kr.url} alt="KR COMMUNITY" className="h-24 w-24 rounded-xl bg-foreground/5 object-contain p-1" />
            <div className="flex-1">
              <div className="font-display text-xl font-bold">KR COMMUNITY</div>
              <div className="text-muted-foreground">L community dyalna</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-discord px-4 py-2 font-bold text-foreground">
                <DiscordLogo className="h-5 w-5" /> Join Server
              </div>
            </div>
          </a>
        </div>
      </Section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VIP Streamers × KR Community
      </footer>
    </>
  );
}

function VipDiscordCard() {
  const [open, setOpen] = useState(false);
  const servers = [
    { name: "VIP-STREAMERS", url: discord.vip },
    { name: "VIP STREAMERS YT", url: discord.vipYt },
  ];
  return (
    <div className={`rounded-2xl border bg-card p-6 transition hover:border-primary ${open ? "border-primary" : ""}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-6 text-left">
        <img src={vip.url} alt="VIP-STREAMERS" className="h-24 w-24 rounded-xl bg-foreground/5 object-contain p-1" />
        <div className="flex-1">
          <div className="font-display text-xl font-bold">VIP-STREAMERS</div>
          <div className="text-muted-foreground">Server support streamers</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-discord px-4 py-2 font-bold text-foreground">
            <DiscordLogo className="h-5 w-5" /> Join Server
          </div>
        </div>
      </button>
      {open && (
        <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
          {servers.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border bg-background p-3 transition hover:-translate-y-0.5 hover:border-primary">
              <img src={vip.url} alt="" className="h-12 w-12 rounded-lg object-contain" />
              <span className="font-display text-sm font-bold">{s.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
