import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateWebhookMutation } from 'store';

import Form from './Form';

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateWebhookMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/webhooks');
  }, [isLoading, isSuccess]);

  return (
    <Form
      returnTo="/webhooks"
      onSubmit={create}
      isSubmitting={isLoading}
      title="New Webhook"
      subtitle="Create a new webhook to send events to"
    />
  );
};

export default New;
