import 'dotenv/config';

// Tracing must be initialized before everything else
// eslint-disable-next-line import/order
import initTracing, { withSpan } from './tracing';
initTracing();

import compression from 'compression';
import express, { NextFunction, Request, Response } from 'express';
import { Joi, ValidationError, validate } from 'express-validation';
import { minify } from 'html-minifier';
import mjml2html from 'mjml';

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
  try {
    const result = withSpan('render', () =>
      mjml2html(req.body.mjml, { keepComments: false, ignoreIncludes: true, validationLevel: 'strict' }),
    );

    const minified = withSpan('minify', () =>
      minify(result.html, {
        collapseWhitespace: true,
        minifyCSS: false,
        caseSensitive: true,
        removeEmptyAttributes: true,
      }),
    );

    res.status(200).json({ html: minified }).end();
  } catch {
    res.status(400).json({ message: 'invalid mjml' }).end();
  }
});

// Error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof ValidationError) res.status(422).json({ details: err.details, message: 'invalid request' }).end();
  else {
    logger.log({
      level: 'error',
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'internal server error' }).end();
  }
});

app.listen(PORT, HOST, () => logger.info(`Listening on ${HOST}:${PORT}...`));
