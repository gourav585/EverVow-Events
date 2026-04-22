# EverVow Events Website

## Run locally with lead API

```bash
npm start
```

Default port is `3100` to avoid clashes with editor previews.
Open `http://127.0.0.1:3100`.

## Deploy on Vercel

- Framework Preset: `Other`
- Root Directory: repository root (this folder)
- Output Directory: leave empty (do not set `dist` or `build`)
- Build Command: leave empty
- Install Command: optional (`npm install`)

This repo includes:
- `vercel.json` for SPA + static page routing
- `api/contact.js` for serverless contact endpoint on Vercel

## Configure analytics and business details

Edit `site-config.js`:

- `ga4MeasurementId`: put your GA4 ID (example: `G-ABC1234567`)
- `metaPixelId`: put your Meta Pixel ID
- `whatsappNumber`, `contactPhone`, `contactEmail`, `siteUrl`

## Page structure

- `index.html`: SPA sections for Home, Services, About, Testimonials, Contact
- `gallery.html`: separate gallery page
- `video.html`: separate video page
- `privacy.html`, `terms.html`: legal pages

## Lead storage

Form submissions are saved to:

- `data/leads.jsonl`

Each line is one JSON object.
