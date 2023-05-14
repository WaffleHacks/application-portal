import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateSchoolMutation } from 'store';

import Form from './Form';

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateSchoolMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/schools');
  }, [isLoading, isSuccess]);

  return (
    <Form
      returnTo="/schools"
      onSubmit={create}
      isSubmitting={isLoading}
      title="New School"
      subtitle="Creates a new school that has been pre-validated"
    />
  );
};

export default New;
