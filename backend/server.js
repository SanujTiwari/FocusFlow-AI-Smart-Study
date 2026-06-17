import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function startServer() {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const connectDB = (await import('./src/config/db.js')).default;

  const authRoutes = (await import('./src/routes/authRoutes.js')).default;
  const subjectRoutes = (await import('./src/routes/subjectRoutes.js')).default;
  const preferenceRoutes = (await import('./src/routes/preferenceRoutes.js')).default;
  const scheduleRoutes = (await import('./src/routes/scheduleRoutes.js')).default;
  const notificationRoutes = (await import('./src/routes/notificationRoutes.js')).default;
  const analyticsRoutes = (await import('./src/routes/analyticsRoutes.js')).default;
  const flashcardRoutes = (await import('./src/routes/flashcardRoutes.js')).default;

  await connectDB();

  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
  }));
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/preferences', preferenceRoutes);
  app.use('/api/schedule', scheduleRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/flashcards', flashcardRoutes);

  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
