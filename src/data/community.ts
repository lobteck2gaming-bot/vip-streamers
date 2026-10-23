export type Streamer = { name: string; platform: "kick" | "youtube"; url: string };

// TODO: replace with the real community streamers
export const streamers: Streamer[] = [
  { name: "Streamer1", platform: "kick", url: "https://kick.com" },
  { name: "Streamer2", platform: "kick", url: "https://kick.com" },
  { name: "Streamer3", platform: "kick", url: "https://kick.com" },
  { name: "Streamer4", platform: "kick", url: "https://kick.com" },
  { name: "Streamer5", platform: "kick", url: "https://kick.com" },
  { name: "Streamer6", platform: "youtube", url: "https://youtube.com" },
  { name: "Streamer7", platform: "youtube", url: "https://youtube.com" },
  { name: "Streamer8", platform: "youtube", url: "https://youtube.com" },
  { name: "Streamer9", platform: "youtube", url: "https://youtube.com" },
  { name: "Streamer10", platform: "youtube", url: "https://youtube.com" },
];

export const staff = [
  { name: "Owner", role: "Founder" },
  { name: "Admin1", role: "Admin" },
  { name: "Mod1", role: "Moderator" },
  { name: "Mod2", role: "Moderator" },
];

export const rules = [
  { t: "Respect", d: "Ihtiram l kolchi — streamers, staff o members. Bla sab o bla tmeyiz." },
  { t: "No Spam", d: "Mamnou3 spam, flood o self-promo bla permission." },
  { t: "No Toxicity", d: "Bla drama, bla hate, bla harassment f chat wla f stream." },
  { t: "Support Each Other", d: "Dkhol l streams dyal sh7abk, follow o share — community kat kber b jma3a." },
  { t: "Follow Platform Rules", d: "Ihtarem les règles dyal Kick, YouTube o Discord." },
  { t: "Listen to Staff", d: "Qrarat dyal staff khass t7tarmo. Ila 3ndk mochkil, ft7 ticket." },
];

// TODO: replace with real Discord invite links
export const discord = {
  vip: "https://discord.gg/8WKV2pETaH",
  kr: "https://discord.gg/GQfPawe7pf",
  vipYt: "https://discord.gg/c2kQjjBFaZ",
};
