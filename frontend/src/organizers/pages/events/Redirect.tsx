import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from 'organizers/components/Loading';
import { useGetEventByCodeQuery } from 'store';

const Redirect = (): JSX.Element => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetEventByCodeQuery(code as string);

  useEffect(() => {
    if (isLoading) return;

    if (data === undefined) {
      navigate('/events');
      toast.error('Event does not exist');
    } else if (data.link) window.location.href = data.link;
    else {
      navigate(`/events/${data.id}`);
      toast.success('No link configured for event, redirecting you to the event details');
    }
  }, [data, isLoading]);

  return <Loading />;
};

export default Redirect;
