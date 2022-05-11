import { ArrowLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import React from 'react';

import { LinkButton } from '../../components/buttons';
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
        <LinkButton to={returnTo}>
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
      </div>
    </div>
  </Card>
);

export default NotFound;
