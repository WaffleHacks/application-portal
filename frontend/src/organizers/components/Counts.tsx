import classNames from 'classnames';
import React from 'react';

interface Props {
  className?: string;
  counts: CountProps[];
}

const Counts = ({ className, counts }: Props): JSX.Element => (
  <dl className={classNames('grid grid-cols-1 gap-5', className)}>
    {counts.map((c) => (
      <Count key={c.label} {...c} />
    ))}
  </dl>
);

interface CountProps {
  label: string;
  count: number;
}

const Count = ({ label, count }: CountProps): JSX.Element => (
  <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
    <dt className="truncate text-sm font-medium text-gray-500">{label} participants</dt>
    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{count}</dd>
  </div>
);

export default Counts;
