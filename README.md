# SeeIMG

An anonymous, image-first web application designed for photographic discovery, direct image uploads, and shared public visual archiving.

## Features

- **Shared Public Discovery**: Public gallery loaded dynamically from Neon PostgreSQL, allowing all visitors to view the same shared photography.
- **Direct Image Uploads**: Client-side browser uploads directly to Cloudinary using an unsigned upload preset without a traditional server.
- **Serverless Metadata Persistence**: Vercel serverless function (`/api/images`) validates and saves image metadata to Neon PostgreSQL.
- **Cloudinary Storage**: Automated cloud storage with secure URL generation and format optimizations.
- **Image Downloads**: Direct download trigger for uploaded images using Cloudinary attachment delivery.
- **Responsive Layout**: Designed for mobile touch screens, tablets, and desktop viewports.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS
- **Icons**: Lucide React
- **Media Storage**: Cloudinary (Direct Unsigned Browser Upload)
- **Database**: Neon PostgreSQL
- **Backend / API**: Vercel Serverless Functions (`@neondatabase/serverless`)

## Architecture

```text
Browser (React + Vite)
   │
   ├─► 1. Uploads file directly via FormData ──► Cloudinary
   │                                                 │
   │                                     (returns secure_url)
   │                                                 │
   └─► 2. Sends image metadata (POST /api/images) ───┤
                                                     ▼
                                        Vercel Serverless API
                                                     │
                                        (parameterized SQL query)
                                                     ▼
                                              Neon PostgreSQL
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm
- Cloudinary account (Cloud Name & Unsigned Upload Preset)
- Neon PostgreSQL database instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Aryan-gupta12-git/See.IMG.git
   cd SeeIMG
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to create a local environment file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your configuration:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser. The local development server includes a built-in handler for `/api/images`.

## Environment Variables

| Variable | Scope | Description | Required |
| :--- | :--- | :--- | :--- |
| `VITE_CLOUDINARY_CLOUD_NAME` | Client (Browser) | Your Cloudinary cloud name | Yes |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Client (Browser) | Name of your unsigned upload preset configured in Cloudinary | Yes |
| `DATABASE_URL` | Server-Only (Vercel) | Neon PostgreSQL connection string | Yes |

> **Important Security Notice**: Never expose your Cloudinary **API Secret** or **DATABASE_URL** in client-side code or prefix them with `VITE_`.

## Database Schema

The application automatically provisions the following table on first connection if it does not already exist:

```sql
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  cloudinary_public_id TEXT,
  image_url TEXT NOT NULL,
  title TEXT,
  aspect_ratio TEXT NOT NULL DEFAULT 'portrait',
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Build & Deployment

To create an optimized production build:

```bash
npm run build
```

To deploy on Vercel:
1. Connect your repository to Vercel.
2. In Project Settings → **Environment Variables**, add:
   - `VITE_CLOUDINARY_CLOUD_NAME` (Type: Config)
   - `VITE_CLOUDINARY_UPLOAD_PRESET` (Type: Config)
   - `DATABASE_URL` (Type: Secret)
3. Deploy! Vercel will automatically compile the frontend and deploy `/api/images.ts` as a serverless function.

## License

This project does not currently have a specified license. License to be determined.
