import { ArrowLeftIcon } from '@heroicons/react/outline';
import React from 'react';
import { useParams } from 'react-router-dom';

import { LinkButton } from '../../../components/buttons';
import { useGetMessageQuery, useUpdateMessageMutation } from '../../../store';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Form from './Form';

const Edit = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading: isDataLoading } = useGetMessageQuery(id as string);

  const [edit, { isLoading }] = useUpdateMessageMutation();

  if (isDataLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that message" returnTo="/messages" />;

  return (
    <>
      <Form
        onSubmit={(v) => edit({ ...v, id: parseInt(id as string) })}
        isSubmitting={isLoading}
        values={{ ...data, recipients: data.recipients.map((r) => r.group) }}
        subtitle="Change details about the message."
      />

      <div className="mt-3">
        <LinkButton to={`/messages/${id}`}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </LinkButton>
      </div>
    </>
  );
};

export default Edit;
