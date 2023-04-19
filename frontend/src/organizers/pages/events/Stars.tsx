import { StarIcon as EmptyStarIcon } from '@heroicons/react/24/outline';
import { StarIcon as FilledStarIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface Props {
  value: number;
}

const Stars = ({ value }: Props): JSX.Element => {
  const stars = [];

  let i = 0;
  for (; i < value; i++)
    stars.push(<FilledStarIcon className="h-6 w-6 text-yellow-500 -mt-0.5 -ml-0.5" aria-hidden="true" />);
  for (; i < 5; i++) stars.push(<EmptyStarIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />);

  return <div className="flex">{stars}</div>;
};

export default Stars;
