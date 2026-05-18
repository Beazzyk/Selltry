import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './utils/env';
import { errorMiddleware } from './middleware/error.middleware';
import { globalRateLimit } from './middleware/rate-limit.middleware';
import routes from './routes';
import { startWorkers } from './jobs';
import { triggerStartupSync } from './services/category-auto-sync.service';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(globalRateLimit);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`[Server] Running on port ${env.PORT} (${env.NODE_ENV})`);
  startWorkers();
  // Daj workerom 3s na start, potem sprawdź czy kategorie wymagają synca
  setTimeout(() => triggerStartupSync().catch(console.warn), 3000);
});

export default app;
