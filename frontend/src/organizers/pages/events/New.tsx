import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateEventMutation } from 'store';

import Form from './Form';

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateEventMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/events');
  }, [isLoading, isSuccess]);

  return (
    <Form
      returnTo="/events"
      onSubmit={create}
      isSubmitting={isLoading}
      title="New Event"
      subtitle="Create a new event to track"
    />
  );
};

export default New;
