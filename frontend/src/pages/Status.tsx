import { useAuth0 } from '@auth0/auth0-react';
import { CheckIcon, RefreshIcon } from '@heroicons/react/outline';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../components/Card';
import { useGetApplicationQuery } from '../store';

const Status = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const { isLoading, isError } = useGetApplicationQuery(user?.sub || '');

  useEffect(() => {
    if (isLoading) return;
    else if (isError) navigate('/new');
  }, [isLoading, isError]);

  if (isLoading)
    return (
      <Card className="flex justify-around">
        <RefreshIcon className="h-8 w-8 animate-spin" />
      </Card>
    );

  return (
    <Card>
      <div>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Submitted!</h3>
          <div className="mt-2 flex justify-center">
            <p className="text-sm text-gray-500 max-w-md">
              We&apos;ve received your application, and you&apos;ll receive an update in the coming weeks. In the
              meantime, why not follow us on{' '}
              <a
                href="https://www.instagram.com/waffle.hacks"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-600"
              >
                Instagram
              </a>
              ,{' '}
              <a
                href="https://www.facebook.com/waffle.hack/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-600"
              >
                Facebook
              </a>
              , and{' '}
              <a
                href="https://twitter.com/WaffleHacks"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-600"
              >
                Twitter
              </a>{' '}
              to keep up-to-date with the latest information.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Status;
