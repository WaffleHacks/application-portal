import * as compression from 'compression';
import * as express from 'express';
import { logger } from 'express-winston';
import { format, transports } from 'winston';

// Get configuration
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8000');

const app = express();

// Register middlewares
app.use(compression());
app.use(
  logger({
    transports: [new transports.Console()],
    format: format.combine(
      format.timestamp(),
      process.env.NODE_ENV === 'production' ? format.json() : format.combine(format.colorize(), format.simple()),
    ),
    meta: true,
    expressFormat: true,
  }),
);

// Healthcheck endpoint
app.get('/health', (req, res) => res.status(204).end());

app.listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}...`));
