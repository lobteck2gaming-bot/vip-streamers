<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the community directory in Cloud with a public read-only policy and all writes behind privileged server functions, because visitors must never be able to edit members.
- Gate the admin panel with a server-only shared password compared timing-safely and an encrypted session flag, because this site has one shared administrator rather than per-user accounts.
- Keep member avatars in a private bucket and hand out short-lived read URLs only for paths the directory references, because public buckets are blocked by workspace policy.
- Rotate the globe with Three.js TrackballControls, because it allows unrestricted multidirectional drag and touch.
- Look up channel avatars server-side as a best-effort platform fetch with an editable fallback image, because key-free platform endpoints can be unavailable.
