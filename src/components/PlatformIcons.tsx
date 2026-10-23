export function KickLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Kick">
      <path d="M3 2h6v5h2V5h2V3h2V2h6v6h-2v2h-2v4h2v2h2v6h-6v-1h-2v-2h-2v-2H9v5H3z" />
    </svg>
  );
}
export function YouTubeLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="YouTube">
      <rect x="1" y="4" width="22" height="16" rx="5" fill="currentColor" />
      <path d="M10 8.5v7l6-3.5z" fill="var(--foreground)" />
    </svg>
  );
}
export function DiscordLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Discord">
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18 18 0 0 0-5.5 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a20 20 0 0 0 6 3l1.3-2a13 13 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4-2 1 1.3 2a20 20 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  );
}
