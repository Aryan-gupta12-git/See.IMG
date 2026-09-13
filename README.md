# SeeIMG

An anonymous, image-first web application designed for photographic discovery and direct image uploads.

## Features

- **Image Discovery**: An editorial masonry gallery displaying uploaded photography.
- **Direct Image Uploads**: Client-side browser uploads directly to Cloudinary without requiring a backend server.
- **Cloudinary Storage**: Automated cloud storage with secure URL generation and format optimizations.
- **Image Downloads**: Direct download trigger for uploaded images using Cloudinary attachment delivery.
- **Responsive Layout**: Designed for mobile touch screens, tablets, and desktop viewports.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Media Ingestion**: Cloudinary (Direct Unsigned Upload API)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

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
   Open `.env.local` and fill in your Cloudinary details:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Yes |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Name of your unsigned upload preset configured in Cloudinary | Yes |

> **Important Security Notice**: Never expose your Cloudinary **API Secret** in client-side code or in `.env` files. SeeIMG communicates directly with Cloudinary using an **Unsigned Upload Preset**; no API Secret or API Key is needed by the frontend.

## Build

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Security Considerations

SeeIMG uses client-side unsigned uploads directly from the browser to Cloudinary. Because the cloud name and upload preset are publicly sent in the upload request:

1. In your Cloudinary console, configure the upload preset with strict constraints:
   - Restrict allowed formats (e.g., `jpg`, `png`, `webp`, `avif`).
   - Set a maximum file size limit (e.g., 10 MB).
   - Restrict incoming transformations as appropriate.
2. The frontend validates file types and sizes before upload, but Cloudinary-side preset constraints provide the authoritative barrier against direct API abuse.

## License

This project does not currently have a specified license. License to be determined.
