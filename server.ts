import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 1. Direct binary upload endpoint (handles raw binary data, perfect for large files without memory buffering)
  app.post("/api/upload", (req, res) => {
    const filename = req.query.filename as string || `upload-${Date.now()}`;
    // Ensure safe name
    const sanitizedFilename = `${Date.now()}-${path.basename(filename)}`;
    const filePath = path.join(uploadsDir, sanitizedFilename);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      res.json({ url: `/uploads/${sanitizedFilename}` });
    });

    writeStream.on('error', (err) => {
      console.error('File upload stream error:', err);
      res.status(500).json({ error: 'File upload failed' });
    });
  });

  // Standard body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development or serving built static SPA in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
