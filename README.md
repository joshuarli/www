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

No package installation, build step, or GitHub Actions are needed. Vercel's Git integration deploys `main` automatically and creates previews for other branches.

Local preview (stdlib `python3` only): `make serve www` serves `sites/www` at `http://127.0.0.1:8000/`. Swap `www` for any entry in `sites/`; override the port with `make serve www PORT=9000`.
