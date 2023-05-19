import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Badge from 'components/Badge';
import { Button, LinkButton } from 'components/buttons';
import { Description, Item, NamedSection, Section } from 'organizers/components/description';
import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { WebhookTriggers, useDeleteWebhookMutation, useGetWebhookQuery } from 'store';

import Confirm from '../../../components/Confirm';

interface StatusBadgeProps {
  enabled: boolean;
  truthy?: string;
  falsy?: string;
}

const StatusBadge = ({ enabled, truthy = 'Yes', falsy = 'No' }: StatusBadgeProps): JSX.Element => (
  <Badge color={enabled ? 'green' : 'red'}>{enabled ? truthy : falsy}</Badge>
);

interface WithId {
  id: string;
}

const DeleteButton = ({ id }: WithId): JSX.Element => {
  const navigate = useNavigate();

  const [deleteWebhook, { isLoading, isSuccess }] = useDeleteWebhookMutation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/webhooks');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Confirm
        isOpen={open}
        close={() => setOpen(false)}
        onClick={() => deleteWebhook(id)}
        title="Delete this webhook?"
        description="Are you sure you want to delete this webhook? Events will no longer be sent to the endpoint. This action cannot be undone."
      />

      <Button type="button" style="danger" onClick={() => setOpen(true)}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </>
  );
};

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetWebhookQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that webhook" returnTo="/webhooks" />;

  return (
    <>
      <Description title={data.url}>
        <Section>
          <Item name="Status">
            <StatusBadge enabled={data.enabled} truthy="Enabled" falsy="Disabled" />
          </Item>
          <Item name="Format">{data.format}</Item>
          <Item name="Signing Secret">*********</Item>
        </Section>
        <NamedSection name="Triggered By">
          {Object.entries(WebhookTriggers).map(([idx, label]) => {
            const index = parseInt(idx);
            return (
              <Item key={index} name={label}>
                <StatusBadge enabled={(data.triggered_by & index) === index} />
              </Item>
            );
          })}
        </NamedSection>
      </Description>

      <div className="mt-3 flex justify-between">
        <LinkButton to="/webhooks">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
        <DeleteButton id={id as string} />
      </div>
    </>
  );
};

export default Detail;
