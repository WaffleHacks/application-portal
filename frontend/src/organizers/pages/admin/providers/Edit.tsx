import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { useGetProviderQuery, useUpdateProviderMutation } from 'store';

import Form from './Form';

const Edit = (): JSX.Element => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useGetProviderQuery(slug as string);
  const [edit, { isLoading: isSubmitting, isSuccess }] = useUpdateProviderMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate(`/providers/${slug}`);
  }, [isLoading, isSuccess]);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that provider" returnTo="/providers" />;

  return (
    <Form
      canEditSlug={false}
      returnTo={`/providers/${slug}`}
      onSubmit={(provider) =>
        edit({ ...provider, client_secret: provider.client_secret === '********' ? undefined : provider.client_secret })
      }
      values={{ ...data, client_secret: '********' }}
      isSubmitting={isSubmitting}
      title="Edit Provider"
    />
  );
};

export default Edit;
