import { ArrowLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import React from 'react';
import { Link } from 'react-router-dom';

import Card from '../../components/Card';

interface Props {
  message: string;
  returnTo: string;
}

const NotFound = ({ message, returnTo }: Props): JSX.Element => (
  <Card>
    <div className="text-center">
      <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 className="mt-2 text-md font-medium text-gray-900">{message}</h3>
      <div className="mt-6">
        <Link
          to={returnTo}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </Link>
      </div>
    </div>
  </Card>
);

export default NotFound;
