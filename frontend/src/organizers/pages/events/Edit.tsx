import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { useGetEventQuery, useUpdateEventMutation } from 'store';

import Form from './Form';

const Edit = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading: isDataLoading } = useGetEventQuery(id as string);
  const [edit, { isLoading, isSuccess }] = useUpdateEventMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate(`/events/${id}`);
  }, [isLoading, isSuccess]);

  if (isDataLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that event" returnTo="/events" />;

  return (
    <Form
      editEnabled
      returnTo={`/events/${id}`}
      values={data}
      onSubmit={(values) => edit({ id: id as string, ...values })}
      isSubmitting={isLoading}
      title="Edit Event"
    />
  );
};

export default Edit;
