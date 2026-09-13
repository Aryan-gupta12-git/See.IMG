import { neon } from '@neondatabase/serverless';

// Helper to sanitize and validate input
const VALID_ASPECT_RATIOS = new Set(['portrait', 'landscape', 'square', 'tall']);
const CLOUDINARY_URL_PATTERN = /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/[^\s"']+$/;

// Cache table initialization per serverless instance lifecycle
let tableInitialized = false;

async function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  const sql = neon(connectionString);
  if (!tableInitialized) {
    try {
      await sql`
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
      `;
      tableInitialized = true;
    } catch (err) {
      console.error('Error ensuring images table exists:', err);
    }
  }
  return sql;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const sql = await getDb();

  // -------------------------------------------------------------
  // GET /api/images — Retrieve public gallery images
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    if (!sql) {
      // If DATABASE_URL is not yet configured, return empty images array with warning
      return res.status(200).json({
        images: [],
        warning: 'DATABASE_URL environment variable is not configured yet on the server.',
      });
    }

    try {
      const rows = await sql`
        SELECT id, cloudinary_public_id, image_url, title, aspect_ratio, width, height, created_at
        FROM images
        ORDER BY created_at DESC
        LIMIT 200;
      `;

      const images = rows.map((row: any) => ({
        id: row.id,
        title: row.title || 'Untitled Study',
        url: row.image_url,
        cloudinaryPublicId: row.cloudinary_public_id || undefined,
        aspectRatio: VALID_ASPECT_RATIOS.has(row.aspect_ratio) ? row.aspect_ratio : 'portrait',
        width: Number(row.width) || 1200,
        height: Number(row.height) || 1600,
        createdAt: row.created_at
          ? new Date(row.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recently',
      }));

      return res.status(200).json({ images });
    } catch (error: any) {
      console.error('Failed to query images from Neon:', error);
      return res.status(500).json({
        error: 'Failed to retrieve images from the database.',
        details: error?.message || 'Database query error',
      });
    }
  }

  // -------------------------------------------------------------
  // POST /api/images — Validate and store new uploaded image metadata
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    if (!sql) {
      return res.status(503).json({
        error: 'Database connection is not configured. Please set the DATABASE_URL environment variable in Vercel.',
      });
    }

    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: 'Malformed JSON payload.' });
        }
      }

      const { url, title, cloudinaryPublicId, aspectRatio, width, height } = body || {};

      // 1. Strict URL validation
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Image URL is required.' });
      }

      if (!CLOUDINARY_URL_PATTERN.test(url)) {
        return res.status(400).json({
          error: 'Invalid image URL. Must be a valid Cloudinary HTTPS upload URL.',
        });
      }

      // Check against configured cloud name if present
      const configuredCloud =
        process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
      if (configuredCloud && !url.includes(`res.cloudinary.com/${configuredCloud}/`)) {
        return res.status(400).json({
          error: 'Image URL does not belong to the configured Cloudinary cloud account.',
        });
      }

      // 2. Metadata sanitization
      const cleanTitle = typeof title === 'string' && title.trim().length > 0
        ? title.trim().slice(0, 100)
        : 'Untitled Study';

      const cleanPublicId = typeof cloudinaryPublicId === 'string' && cloudinaryPublicId.trim().length > 0
        ? cloudinaryPublicId.trim().slice(0, 255)
        : null;

      const cleanAspectRatio = VALID_ASPECT_RATIOS.has(aspectRatio) ? aspectRatio : 'portrait';
      const cleanWidth = Number.isInteger(width) && width > 0 && width <= 20000 ? width : 1200;
      const cleanHeight = Number.isInteger(height) && height > 0 && height <= 20000 ? height : 1600;

      // 3. Server-controlled ID generation
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      // 4. Parameterized SQL insert into Neon
      await sql`
        INSERT INTO images (
          id,
          cloudinary_public_id,
          image_url,
          title,
          aspect_ratio,
          width,
          height
        ) VALUES (
          ${id},
          ${cleanPublicId},
          ${url},
          ${cleanTitle},
          ${cleanAspectRatio},
          ${cleanWidth},
          ${cleanHeight}
        );
      `;

      return res.status(201).json({
        image: {
          id,
          title: cleanTitle,
          url,
          cloudinaryPublicId: cleanPublicId || undefined,
          aspectRatio: cleanAspectRatio,
          width: cleanWidth,
          height: cleanHeight,
          createdAt: 'Just now',
        },
      });
    } catch (error: any) {
      console.error('Failed to insert image record into Neon:', error);
      return res.status(500).json({
        error: 'Database error occurred while persisting image metadata.',
        details: error?.message || 'Insert error',
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
