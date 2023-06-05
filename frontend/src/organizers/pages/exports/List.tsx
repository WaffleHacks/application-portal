import { ArrowPathIcon, DocumentArrowDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';

import Badge, { Color } from 'components/Badge';
import { Button, LinkButton } from 'components/buttons';
import Link from 'components/Link';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from 'organizers/components/table';
import { Export, ExportStatus, useGetExportDownloadUrlQuery, useListExportsQuery } from 'store';

interface WithId {
  id: number;
}

const DownloadButton = ({ id }: WithId): JSX.Element => {
  const [clicked, setClicked] = useState(false);
  const { data, isLoading, isSuccess } = useGetExportDownloadUrlQuery(id, { skip: !clicked });

  useEffect(() => {
    if (!isLoading && isSuccess) window.open(data.url);
  }, [isLoading, isSuccess]);

  const onClick = () => {
    if (!clicked) setClicked(true);
    if (data) window.open(data.url);
  };

  return (
    <Button size="sm" type="button" onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Downloading...' : 'Download'}
      {isLoading ? (
        <ArrowPathIcon className="ml-2 h-4 w-4" aria-hidden="true" />
      ) : (
        <DocumentArrowDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
};

const Row = ({ id, name, status, requester, created_at, finished_at }: Export): JSX.Element => {
  let timestamp: DateTime;
  if (status === ExportStatus.Processing) timestamp = DateTime.fromISO(created_at);
  else timestamp = DateTime.fromISO(finished_at as string);
  const formattedTimestamp =
    timestamp.diffNow().negate().as('days') > 1
      ? timestamp.toLocaleString(DateTime.DATETIME_SHORT)
      : timestamp.toRelative();

  return (
    <tr>
      <Table.Data index className="py-6">
        {name}
      </Table.Data>
      <Table.Data>{requester}</Table.Data>
      <Table.Data>
        <Badge color={badgeColor(status)}>{status}</Badge>
      </Table.Data>
      <Table.Data>{formattedTimestamp}</Table.Data>

      <Table.Data className="relative text-right sm:pr-6">
        {status === ExportStatus.Completed && <DownloadButton id={id} />}
      </Table.Data>
    </tr>
  );
};

const badgeColor = (status: ExportStatus): Color => {
  switch (status) {
    case ExportStatus.Processing:
      return 'yellow';
    case ExportStatus.Completed:
      return 'green';
    case ExportStatus.Failed:
      return 'red';
  }
};

const List = (): JSX.Element => {
  const { data = [], isLoading, refetch } = useListExportsQuery();
  const { paginated, ...paginationProps } = usePagination(data);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Download data as CSVs</p>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <LinkButton to="/exports/new" style="success">
          <PlusIcon className="h-4 w-4 mr-2" />
          New
        </LinkButton>
        <Button type="button" className="ml-2" onClick={refetch}>
          <ArrowPathIcon className={classNames('h-4 w-4 mr-2', { 'animate-spin': isLoading })} />
          Refresh
        </Button>
      </div>

      <Table className="mt-2">
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Requester</Table.Label>
          <Table.Label>Status</Table.Label>
          <Table.Label>At</Table.Label>
          <Table.InvisibleLabel>Download</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && (
            <EmptyRow
              message="No exports yet, get started by creating one."
              callToAction={
                <Link
                  to="/exports/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New export
                </Link>
              }
            />
          )}
          {!isLoading && paginated.map((e) => <Row key={e.id} {...e} />)}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
