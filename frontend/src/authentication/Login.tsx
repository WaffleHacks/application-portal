import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { useListProvidersQuery } from 'store';
import { ReducedProvider } from 'store/types';

import Layout from './components/Layout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const Login = (): JSX.Element => {
  const { data: providers = [], isLoading } = useListProvidersQuery();

  let inner;
  if (isLoading) {
    inner = <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin" />;
  } else if (providers.length === 0) {
    inner = (
      <p className="text-red-500 font-bold text-center">
        Uh oh! No providers were configured, please contact the organizers!
      </p>
    );
  } else {
    inner = (
      <>
        <p className="-mt-4 text-center text-lg">Select a login provider:</p>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {providers.map((p) => (
            <LaunchButton key={p.slug} {...p} />
          ))}
        </div>
      </>
    );
  }

  return <Layout title="Sign in to your account">{inner}</Layout>;
};

const LaunchButton = ({ slug, name, icon }: ReducedProvider): JSX.Element => (
  <a
    href={`${API_BASE_URL}/auth/oauth/launch/${slug}`}
    className="flex w-full items-center justify-center gap-3 rounded-md bg-gray-100 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
  >
    <img className="h-5" aria-hidden="true" alt={`${name} logo`} src={icon} />
    <span className="text-sm font-semibold leading-6">{name}</span>
  </a>
);

export default Login;
