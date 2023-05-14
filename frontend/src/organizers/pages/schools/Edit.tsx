import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { useGetSchoolQuery, useUpdateSchoolMutation } from 'store';

import Form from './Form';

const Edit = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading: isDataLoading } = useGetSchoolQuery(id as string);
  const [update, { isLoading, isSuccess }] = useUpdateSchoolMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate(`/schools/${id}`);
  }, [isLoading, isSuccess]);

  if (isDataLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that school" returnTo="/schools" />;

  return (
    <Form
      returnTo={`/schools/${id}`}
      values={data}
      onSubmit={(v) => update({ id: id as string, ...v })}
      isSubmitting={isLoading}
      title="Edit School"
      subtitle="Change the details of this school"
    />
  );
};

export default Edit;
