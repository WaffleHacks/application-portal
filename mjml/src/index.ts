import * as compression from 'compression';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { Joi, ValidationError, validate } from 'express-validation';

import logger, { middleware } from './logging';

// Get configuration
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8007');

const app = express();

// Register middlewares
app.use(compression());
app.use(express.json());
app.use(middleware);

// Healthcheck endpoint
app.get('/health', (req, res) => res.status(204).end());

// Renderer endpoint
const renderBody = {
  body: Joi.object({
    mjml: Joi.string().required(),
  }),
};
app.post('/render', validate(renderBody), (req, res) => {
  console.log(req.body.mjml);

  res.status(200).end();
});

// Error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof ValidationError) res.status(422).json(err.details).end();
  else {
    logger.log({
      level: 'error',
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'internal server error' }).end();
  }
});

app.listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}...`));
