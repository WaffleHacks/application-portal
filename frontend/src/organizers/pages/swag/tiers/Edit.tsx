import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetSwagTierQuery, useUpdateSwagTierMutation } from '../../../../store';
import Loading from '../../../components/Loading';
import NotFound from '../../../components/NotFound';
import Form from './Form';

const Edit = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading: isDataLoading } = useGetSwagTierQuery(id as string);
  const [edit, { isLoading, isSuccess }] = useUpdateSwagTierMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate(`/swag/tiers/${id}`);
  }, [isLoading, isSuccess]);

  if (isDataLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that swag tier" returnTo="/swag/tiers" />;

  return (
    <Form
      returnTo={`/swag/tiers/${id}`}
      values={data}
      onSubmit={(values) => edit({ id: parseInt(id as string), ...values })}
      isSubmitting={isLoading}
      title="Edit Tier"
    />
  );
};

export default Edit;
