# Deploying (Cloudflare Workers Builds)

The live site builds from `main` on Cloudflare (see `wrangler.jsonc`).

- **Merge one pull request at a time**, and wait for its build to finish before merging the next. If several merges land within a minute or two, Cloudflare can mark the later builds as *skipped* (a grey skip icon in Deployments) and the newest code never goes live.
- If a build shows as skipped: open Workers & Pages → the project → Deployments → the `⋯` menu on the newest build → **Retry build**; or push any small new commit to `main`.
- Check the result at https://worldbridgemeridian.com (hard-refresh, or open a private tab).
