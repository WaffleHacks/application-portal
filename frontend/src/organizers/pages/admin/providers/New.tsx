import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateProviderMutation } from '../../../../store';
import Form from './Form';

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateProviderMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/providers');
  }, [isLoading, isSuccess]);

  return (
    <Form
      returnTo="/providers"
      onSubmit={create}
      isSubmitting={isLoading}
      title="New Provider"
      subtitle="Create a new provider to login with"
    />
  );
};

export default New;
