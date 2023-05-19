import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Form from './Form';
import { useGetWebhookQuery, useUpdateWebhookMutation } from '../../../store';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';

const Edit = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useGetWebhookQuery(id as string);
  const [edit, { isLoading: isSubmitting, isSuccess }] = useUpdateWebhookMutation();

  useEffect(() => {
    if (!isSubmitting && isSuccess) navigate(`/webhooks/${id}`);
  }, [isSubmitting, isSuccess]);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that webhook" returnTo="/webhooks" />;

  return (
    <Form
      returnTo="/webhooks"
      values={{ ...data, secret: '********' }}
      onSubmit={(webhook) =>
        edit({
          ...webhook,
          secret: webhook.secret === '********' ? undefined : webhook.secret,
          id: parseInt(id as string),
        })
      }
      isSubmitting={isSubmitting}
      title="Edit Webhook"
    />
  );
};

export default Edit;
