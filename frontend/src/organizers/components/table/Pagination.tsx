import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { useState } from 'react';

interface PaginationParams<Type> extends Props {
  paginated: Type[];
}

export const usePagination = <Type,>(items: Type[], size = 20): PaginationParams<Type> => {
  const [page, setPage] = useState(0);

  const rawMax = Math.floor(items.length / size);
  const max = items.length % size === 0 && items.length !== 0 ? rawMax - 1 : rawMax;

  const paginated = items.slice(size * page, size + size * page);

  return { paginated, page, setPage, max };
};

interface NumberProps {
  current?: boolean;
  page: number;
  setPage: (p: number) => void;
}

const Number = ({ current = false, page, setPage }: NumberProps): JSX.Element => (
  <button
    type="button"
    onClick={() => setPage(page)}
    disabled={current}
    aria-current={current ? 'page' : undefined}
    className={classNames(
      'border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium',
      current
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    )}
  >
    {page + 1}
  </button>
);

const Ellipsis = (): JSX.Element => (
  <span className="border-transparent text-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">
    ...
  </span>
);

interface Props {
  page: number;
  setPage: (p: number) => void;
  max: number;
}

const Pagination = ({ page, setPage, max }: Props): JSX.Element => {
  return (
    <nav className="mt-3 border-t border-gray-200 px-4 flex items-center justify-between sm:px-0">
      <div className="-mt-px w-0 flex-1 flex">
        <button
          type="button"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className={classNames(
            'pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500',
            page === 0 ? '' : 'border-t-2 border-transparent hover:text-gray-700 hover:border-gray-300',
          )}
        >
          <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          Previous
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">
        <Number page={0} setPage={setPage} current={page === 0} />
        {page > 2 && <Ellipsis />}
        {page > 1 && <Number page={page - 1} setPage={setPage} />}
        {page !== 0 && page !== max && <Number page={page} setPage={setPage} current={true} />}
        {page < max - 1 && <Number page={page + 1} setPage={setPage} />}
        {page < max - 2 && <Ellipsis />}
        {max !== 0 && <Number page={max} setPage={setPage} current={page === max} />}
      </div>
      <div className="-mt-px w-0 flex-1 flex justify-end">
        <button
          type="button"
          onClick={() => setPage(Math.min(max, page + 1))}
          disabled={page === max}
          className={classNames(
            'pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500',
            page === max ? '' : 'border-t-2 border-transparent hover:text-gray-700 hover:border-gray-300',
          )}
        >
          Next
          <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
