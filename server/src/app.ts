import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadDirectory = path.resolve(__dirname, '../', env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadDirectory));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
