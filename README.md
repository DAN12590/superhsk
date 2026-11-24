# SuperHSK website

Website of SuperHSK, an Android app for learning Chinese from scratch, from HSK 1 to HSK 4.

**Live site: [superhsk.danapps.dev](https://superhsk.danapps.dev/)** · [Español](https://superhsk.danapps.dev/es/)

Built with [Astro](https://astro.build) and deployed to GitHub Pages on every push to `main`.

```
npm install
npm run dev
```

The owner details on the legal pages come from build-time environment variables (`OWNER_NAME`,
`OWNER_ID`, `OWNER_ADDRESS`): repository secrets in GitHub Actions, or a local `.env` file that is
not committed.
