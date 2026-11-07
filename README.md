# www

Minimal static-site monorepo. Each site is a separate Vercel project, connected to this repository's `main` branch with its own **Root Directory**.

| Site | Root Directory | Requested hostname | Vercel project |
| --- | --- | --- | --- |
| Portfolio | `sites/www` | `joshuarli.vercel.app` | `joshuarli` |
| Garden | `sites/garden` | `garden.vercel.dev` | `garden` |
| Token Garden | `sites/token-garden` | `token.garden.vercel.dev` | `token-garden` |
| Systems | `sites/systems` | `systems.vercel.dev` | `systems` |
| Laputa Systems | `sites/laputa-systems` | `laputa.systems.vercel.dev` | `laputa-systems` |
| Aincrad | `sites/aincrad` | `aincrad.vercel.dev` | `aincrad` |

The `.vercel.dev` hostnames above are **requested** domains; their assignment and ownership depend on Vercel's domain restrictions. Each site has an independent `.vercel.app` deployment address when deployed.

No package installation, build step, or GitHub Actions are needed. The portfolio loads pinned Three.js on idle for an optional GPU cloud effect, but its HTML and CSS work without JavaScript. Vercel's Git integration deploys `main` automatically and creates previews for other branches.
