# SeenAI Dashboard

A custom dashboard for uploading videos or audio to the SeenAI platform. Files are sent to the backend for analysis and the results – transcript, tone rating, emotional frames and more – are displayed in an easy to read format.

## Setup

```bash
npm install
npm run dev
```

The app is a standard [Next.js](https://nextjs.org/) project. Development server runs at `http://localhost:3000`.

## File Structure

- `src/lib/` – Supabase client and video service helpers
- `src/components/` – Reusable React components (upload form, sidebar, video cards)
- `src/app/` – Next.js route handlers and pages
- `public/` – Static assets

## Usage

1. Sign up or log in.
2. Upload a video using the form on the dashboard.
3. After processing, recent uploads and analysis results appear below the form.

The dashboard is prepared for future features such as sending results to GPT, exporting a PDF and saving to a personal library. These buttons are present but disabled by default.

## Notes

- The backend `/analyze` endpoint is expected to return `frames`, `transcript` and `tone_rating` fields which will be displayed once available.
- Supabase credentials are loaded from environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
