import { ArrowLeftIcon, ExclamationIcon, ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../components/buttons';
import Confirm from '../../../components/Confirm';
import Link from '../../../components/Link';
import {
  Status,
  useGetApplicationQuery,
  useGetApplicationResumeQuery,
  useSetApplicationStatusMutation,
  useUpdateApplicationMutation,
} from '../../../store';
import { Description, ExternalLinkItem, Item, NamedSection } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import StatusBadge from '../../components/StatusBadge';

interface WithId {
  id: string;
}

const ResumeLink = ({ id }: WithId): JSX.Element => {
  const [clicked, setClicked] = useState(false);
  const { data, isLoading, isSuccess } = useGetApplicationResumeQuery(id, { skip: !clicked });

  useEffect(() => {
    if (!isLoading && isSuccess) window.open(data.url);
  }, [isLoading, isSuccess]);

  // Allow clicking multiple times w/o re-fetching
  const onClick = () => {
    if (!clicked) setClicked(true);
    if (data) window.open(data.url);
  };

  return (
    <Button type="button" onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Opening...' : 'Open'}
      {isLoading ? (
        <RefreshIcon className="ml-2 h-4 w-4" aria-hidden="true" />
      ) : (
        <ExternalLinkIcon className="ml-2 h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
};

interface NotesProps extends WithId {
  notes: string;
}

const Notes = ({ id, notes: initialNotes }: NotesProps): JSX.Element => {
  const [notes, setNotes] = useState(initialNotes);
  const [update, { isLoading }] = useUpdateApplicationMutation();

  return (
    <div className="relative">
      <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <label htmlFor="notes" className="sr-only">
          Add your comment
        </label>
        <textarea
          rows={3}
          name="notes"
          id="notes"
          className="block w-full py-3 border-0 resize-none focus:ring-0 sm:text-sm"
          placeholder="Add any notes for this application..."
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />

        {/* Spacer element to match the height of the toolbar */}
        <div className="py-2" aria-hidden="true">
          {/* Matches height of button in toolbar (1px border + 36px content height) */}
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 pl-3 pr-2 py-2 flex justify-end">
        <Button type="button" style="primary" onClick={() => update({ id, notes })}>
          {isLoading ? <RefreshIcon className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  );
};

const statusOptions: Status[] = [Status.Accepted, Status.Rejected];
const SetStatus = ({ id }: WithId): JSX.Element => {
  const [open, setOpen] = useState(false);

  const [status, setStatus] = useState(Status.Accepted);
  const [update, { isLoading }] = useSetApplicationStatusMutation();

  return (
    <>
      <Confirm
        isOpen={open}
        close={() => setOpen(false)}
        onClick={() => update({ id, status })}
        title={`Change the status to ${status}?`}
        description={`Are you sure you want to mark this application as ${status}? Changing the status of this application is irreversible.`}
        truthy={isLoading ? <RefreshIcon className="h-4 w-4 animate-spin" /> : 'Yes'}
        style="warning"
      />
      <div className="flex justify-around">
        <fieldset className="mt-2">
          <legend className="sr-only">Application status</legend>
          <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
            {statusOptions.map((s) => (
              <div key={s} className="flex items-center">
                <input
                  id={`status-${s}`}
                  name={`status-${s}`}
                  type="radio"
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor={`status-${s}`} className="ml-3 block text-sm font-medium text-gray-700">
                  <StatusBadge status={s} />
                </label>
              </div>
            ))}
          </div>
        </fieldset>
        <Button type="button" style="secondary" onClick={() => setOpen(true)}>
          {isLoading ? <RefreshIcon className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </>
  );
};

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetApplicationQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that application" returnTo="/applications" />;

  const age = DateTime.fromFormat(data.date_of_birth, 'd-M-yyyy').diffNow('years').negate().years;

  return (
    <>
      <Description
        title={`${data.participant.first_name} ${data.participant.last_name}`}
        titleLeft={<StatusBadge status={data.status} large />}
        subtitle={`Applied at: ${DateTime.fromISO(data.created_at).toLocaleString(DateTime.DATETIME_SHORT)}`}
      >
        <NamedSection name="About">
          <Item name="Email" value={data.participant.email} />
          <Item name="Phone" value={data.phone_number} />
          <Item name="Gender" value={data.gender} />
          <Item name="Race / Ethnicity" value={data.race_ethnicity} />
          <Item
            name="Date of Birth"
            value={
              <span className="flex">
                {data.date_of_birth} (<b>{Math.trunc(age)} y/o</b>)
                {age < 13 && <ExclamationIcon className="ml-1 text-yellow-500 w-5 h-5" aria-hidden="true" />}
              </span>
            }
          />
        </NamedSection>
        <NamedSection name="Education">
          <Item
            name="School"
            value={
              <Link to={`/schools/${data.school.id}`} className="text-blue-500 hover:text-blue-700 hover:underline">
                {data.school.name}
              </Link>
            }
          />
          <Item name="Expected Graduation Year" value={data.graduation_year || 'N/A'} />
          <Item name="Level of Study" value={data.level_of_study} />
          <Item name="Major" value={data.major || 'N/A'} />
        </NamedSection>
        <NamedSection name="Experience">
          <ExternalLinkItem name="Portfolio" value={data.portfolio_url} />
          <ExternalLinkItem name="Repositories" value={data.vcs_url} />
          <Item name="Hackathons attended" value={data.hackathons_attended} />
          <Item name="Share with sponsors?" value={data.share_information ? 'Yes' : 'No'} />
          <Item name="Resume" value={data.resume ? <ResumeLink id={id as string} /> : 'N/A'} />
        </NamedSection>
        <NamedSection name="Shipping">
          <Item name="Address" value={data.shipping_address || 'N/A'} />
          <Item name="Country" value={data.country} />
        </NamedSection>
        <NamedSection name="Organizer Information" description="This section is only visible to organizers">
          <Item name="Notes" wide>
            <Notes id={id as string} notes={data.notes} />
          </Item>
          {data.status === Status.Pending && (
            <Item name="Status">
              <SetStatus id={id as string} />
            </Item>
          )}
        </NamedSection>
      </Description>

      <div className="mt-3">
        <Button type="button" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </Button>
      </div>
    </>
  );
};

export default Detail;
