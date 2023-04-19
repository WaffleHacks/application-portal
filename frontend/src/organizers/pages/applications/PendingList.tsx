import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { DateTime } from 'luxon';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { SortKey, sort } from './list';
import { Button } from '../../../components/buttons';
import Confirm from '../../../components/Confirm';
import Link from '../../../components/Link';
import {
  ApplicationStatus,
  ReducedApplication,
  useBulkSetApplicationStatusMutation,
  useListApplicationsQuery,
} from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination, useSorting } from '../../components/table';
import WarningFlag from '../../components/WarningFlag';

interface RowProps {
  application: ReducedApplication;
  selected: number[];
  setSelected: (selected: number[]) => void;
  disabled: boolean;
}

const Row = ({ application, selected, setSelected, disabled }: RowProps): JSX.Element => {
  const createdAt = DateTime.fromISO(application.created_at);
  const formattedCreatedAt =
    createdAt.diffNow().negate().as('days') > 1
      ? createdAt.toLocaleString(DateTime.DATETIME_SHORT)
      : createdAt.toRelative();

  const isSelected = selected.includes(application.participant.id);

  return (
    <tr className={isSelected ? 'bg-gray-50' : undefined}>
      <Table.Data index className="relative w-12 px-6 sm:w-16 sm:px-8">
        {isSelected && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
        <input
          type="checkbox"
          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
          value={application.participant.id}
          checked={isSelected}
          onChange={(e) =>
            setSelected(
              e.target.checked
                ? [...selected, application.participant.id]
                : selected.filter((id) => id !== application.participant.id),
            )
          }
          disabled={disabled}
        />
      </Table.Data>
      <Table.Data index className={isSelected ? 'text-indigo-600' : 'text-gray-900'}>
        <span className="flex">
          {application.participant.first_name} {application.participant.last_name}
          {application.flagged && <WarningFlag reason="This participant may be ineligible" />}
        </span>
      </Table.Data>
      <Table.Data>{application.participant.email}</Table.Data>
      <Table.Data>{application.country}</Table.Data>
      <Table.Data>{formattedCreatedAt}</Table.Data>
      <Table.Data className="relative text-right sm:pr-6">
        <Link to={`/applications/${application.participant.id}`} className="text-indigo-600 hover:text-indigo-900">
          Details
        </Link>
      </Table.Data>
    </tr>
  );
};

const PendingList = (): JSX.Element => {
  // Listing and displaying data
  const { data = [], isLoading } = useListApplicationsQuery();
  const filtered = data.filter((a) => a.status === ApplicationStatus.Pending);
  const { sorted, ...sortableProps } = useSorting<SortKey, ReducedApplication>(filtered, sort, SortKey.AppliedAt);
  const { paginated, ...paginationProps } = usePagination(sorted);
  const { setPage } = paginationProps;

  // Bulk operation selection
  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  useLayoutEffect(() => {
    setChecked(selected.length === sorted.length && sorted.length !== 0);

    const isIndeterminate = selected.length > 0 && selected.length < sorted.length;
    setIndeterminate(isIndeterminate);

    if (checkbox.current !== null) checkbox.current.indeterminate = isIndeterminate;
  }, [selected]);

  const toggleAll = () => {
    setSelected(checked || indeterminate ? [] : sorted.map((a) => a.participant.id));
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  };

  // Bulk operation actions
  const [bulkSetStatus, { isLoading: isSetStatusLoading, isSuccess: isSetStatusSuccess }] =
    useBulkSetApplicationStatusMutation();
  const [status, setStatus] = useState(ApplicationStatus.Pending);

  // Reset the checked items on success
  useEffect(() => {
    if (!isSetStatusLoading && isSetStatusSuccess) {
      setSelected([]);
      setPage(0);
    }
  }, [isSetStatusLoading, isSetStatusSuccess]);

  return (
    <>
      <Confirm
        isOpen={status !== ApplicationStatus.Pending}
        close={() => setStatus(ApplicationStatus.Pending)}
        onClick={() => bulkSetStatus({ status, ids: selected })}
        title={`Mark ${selected.length} applications as ${status}?`}
        description={`Are you sure you want to change the status of ${selected.length} applications to ${status}? Make sure you have checked that these applicants are eligible to participate. Changing the status of these applications is irreversible.`}
        truthy={isSetStatusLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : 'Yes'}
        style="warning"
      />

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            The name, email, country, and application date of all participants with pending applications waiting to be
            reviewed.
          </p>
        </div>
      </div>

      <div className="mt-5 -mb-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            {selected.length > 0 && (
              <div className="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16">
                <Button
                  type="button"
                  style="success"
                  disabled={isSetStatusLoading}
                  onClick={() => setStatus(ApplicationStatus.Accepted)}
                >
                  {isSetStatusLoading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden={true} />
                  ) : (
                    'Accept'
                  )}
                </Button>
                <Button
                  type="button"
                  style="danger"
                  disabled={isSetStatusLoading}
                  onClick={() => setStatus(ApplicationStatus.Rejected)}
                >
                  {isSetStatusLoading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden={true} />
                  ) : (
                    'Reject'
                  )}
                </Button>
              </div>
            )}

            {/* The empty class overrides the default which messes up the padding */}
            <Table className="">
              <Table.Head>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                    ref={checkbox}
                    checked={checked}
                    onChange={toggleAll}
                    disabled={isSetStatusLoading}
                  />
                </th>
                <Table.SortableLabel index by={SortKey.Name} {...sortableProps}>
                  Name
                </Table.SortableLabel>
                <Table.SortableLabel by={SortKey.Email} {...sortableProps}>
                  Email
                </Table.SortableLabel>
                <Table.SortableLabel by={SortKey.Country} {...sortableProps}>
                  Country
                </Table.SortableLabel>
                <Table.SortableLabel by={SortKey.AppliedAt} {...sortableProps}>
                  Applied At
                </Table.SortableLabel>
                <Table.InvisibleLabel>View</Table.InvisibleLabel>
              </Table.Head>
              <Table.Body>
                {isLoading && <LoadingRow span={6} />}
                {!isLoading && paginated.length === 0 && <EmptyRow message="No pending applications yet." span={6} />}
                {!isLoading &&
                  paginated.map((a) => (
                    <Row
                      key={a.participant.id}
                      application={a}
                      selected={selected}
                      setSelected={setSelected}
                      disabled={isSetStatusLoading}
                    />
                  ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>

      <Pagination {...paginationProps} />
    </>
  );
};

export default PendingList;
