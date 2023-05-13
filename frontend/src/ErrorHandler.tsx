import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React, { FC, ReactNode } from 'react';

const API_KEY = process.env.REACT_APP_BUGSNAG_API_KEY;
const VERSION = process.env.REACT_APP_BUGSNAG_VERSION || 'dev';

const BRANCH = process.env.REACT_APP_BUGSNAG_BRANCH || 'dev';
const STAGE = BRANCH === 'main' ? 'production' : BRANCH;

console.log(VERSION);
console.log(BRANCH);
console.log(STAGE);

interface Props {
  children: ReactNode;
}

let ErrorHandler: FC<Props>;

if (API_KEY === undefined) {
  // eslint-disable-next-line react/display-name
  ErrorHandler = ({ children }: Props): JSX.Element => <>{children}</>;
} else {
  Bugsnag.start({
    apiKey: API_KEY,
    appVersion: VERSION.substring(0, 7),
    releaseStage: STAGE,
    plugins: [new BugsnagPluginReact()],
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);

  // eslint-disable-next-line react/display-name
  ErrorHandler = ({ children }: Props): JSX.Element => <ErrorBoundary>{children}</ErrorBoundary>;
}

export default ErrorHandler;
