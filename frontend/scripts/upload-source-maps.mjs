import { browser } from '@bugsnag/source-maps';

const API_KEY = process.env.REACT_APP_BUGSNAG_API_KEY;
const VERSION = process.env.CF_PAGES_COMMIT_SHA || 'dev';
const BASE_DOMAIN = process.env.CF_PAGES_URL || 'https://localhost.localdomain:3000';

async function main() {
  if (API_KEY === undefined) {
    console.error('Missing REACT_APP_BUGSNAG_API_KEY environment variable');
    process.exit(1);
  }

  await browser.uploadMultiple({
    apiKey: API_KEY,
    appVersion: VERSION.substring(0, 7),
    overwrite: true,
    directory: './build/static/js',
    baseUrl: `${BASE_DOMAIN}/static/js`,
  });
}

main();
