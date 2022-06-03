import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateSwagTierMutation } from '../../../../store';
import Form from './Form';

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateSwagTierMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/swag/tiers');
  }, [isLoading, isSuccess]);

  return (
    <Form
      returnTo="/swag/tiers"
      onSubmit={create}
      isSubmitting={false}
      title="New Tier"
      subtitle="Create a new swag tier for participants"
    />
  );
};

export default New;
