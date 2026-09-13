import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }
  if (env.VITE_CLOUDINARY_CLOUD_NAME) {
    process.env.VITE_CLOUDINARY_CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
  }

  return {
    plugins: [
      react(),
      {
        name: 'neon-serverless-api-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlPath = req.url ? req.url.split('?')[0] : '';
            if (urlPath === '/api/images') {
              try {
                let rawBody = '';
                req.on('data', (chunk) => {
                  rawBody += chunk;
                });
                req.on('end', async () => {
                  try {
                    (req as any).body = rawBody ? JSON.parse(rawBody) : {};
                  } catch {
                    (req as any).body = rawBody;
                  }

                  if (!(res as any).status) {
                    (res as any).status = function (statusCode: number) {
                      res.statusCode = statusCode;
                      return res;
                    };
                  }
                  if (!(res as any).json) {
                    (res as any).json = function (data: any) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return res;
                    };
                  }

                  const { default: handler } = await server.ssrLoadModule('/api/images.ts');
                  await handler(req, res);
                });
                return;
              } catch (err: any) {
                console.error('[API Dev Error]', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
  };
});
