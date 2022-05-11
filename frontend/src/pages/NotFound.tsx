import { ArrowSmLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import React from 'react';

import { LinkButton } from '../components/buttons';
import Card from '../components/Card';

const NotFound = (): JSX.Element => (
  <Card>
    <div className="text-center py-20">
      <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">Page not found</h3>
      <p className="mt-1 text-sm text-gray-500">
        We could&apos;t find the page you were looking for. Please check it&apos;s correct and try again.
      </p>
      <div className="mt-6">
        <LinkButton to="/">
          <ArrowSmLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Return home
        </LinkButton>
      </div>
    </div>
  </Card>
);

export default NotFound;
