import { ArrowLeftIcon } from '@heroicons/react/outline';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LinkButton } from '../../../components/buttons';
import { useCreateMessageMutation } from '../../../store';
import Form from './Form';

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateMessageMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/messages');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Form onSubmit={create} isSubmitting={isLoading} subtitle="Creates a new message to send to recipients." />

      <div className="mt-3">
        <LinkButton to="/messages">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
      </div>
    </>
  );
};

export default New;
