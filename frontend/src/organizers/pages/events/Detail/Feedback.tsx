import { StarIcon as EmptyStarIcon } from '@heroicons/react/24/outline';
import { StarIcon as FilledStarIcon } from '@heroicons/react/24/solid';
import React from 'react';

import Link from 'components/Link';
import { Description } from 'organizers/components/description';
import { Pagination, usePagination } from 'organizers/components/table';
import { Feedback } from 'store';

import Badge from '../../../../components/Badge';

interface RatingProps {
  label: string;
  value: number;
}

const Rating = ({ label, value }: RatingProps): JSX.Element => {
  const filled = Array.from(Array(value).keys());
  const empty = Array.from(Array(5 - value).keys());

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-1 flex">
        {filled.map((_, index) => (
          <FilledStarIcon key={index} className="h-6 w-6 text-yellow-500 -mt-0.5 -ml-0.5" aria-hidden="true" />
        ))}
        {empty.map((_, index) => (
          <EmptyStarIcon key={index} className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ))}
      </div>
    </div>
  );
};

const Row = (feedback: Feedback): JSX.Element => (
  <li className="mx-4 py-5 flex-auto">
    <Link
      to={`/applications/${feedback.participant.id}`}
      className="text-md font-medium leading-6 text-blue-500 hover:underline"
    >
      {feedback.participant.first_name} {feedback.participant.last_name}
    </Link>
    <div className="mt-1 gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <Rating label="Presentation" value={feedback.presentation} />
      <Rating label="Content" value={feedback.content} />
      <Rating label="Engagement" value={feedback.interest} />
      <div>
        <p className="text-sm font-medium text-gray-500">Should we do it again?</p>
        <Badge className="mt-1" color={feedback.again ? 'green' : 'red'}>
          {feedback.again ? 'Yes' : 'No'}
        </Badge>
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500">Comments</p>
      <p className="mt-1 text-sm text-gray-900">{feedback.comments}</p>
    </div>
  </li>
);

interface Props {
  feedback: Feedback[];
}

const FeedbackList = ({ feedback }: Props): JSX.Element => {
  const { paginated, ...paginationProps } = usePagination(feedback, 5);

  return (
    <Description title="Feedback">
      <div className="flex flex-col mx-4">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <ul role="list" className="min-w-full divide-y divide-gray-300">
              {paginated.map((f) => (
                <Row key={f.participant.id} {...f} />
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-4 my-4 pb-4">
        <Pagination {...paginationProps} />
      </div>
    </Description>
  );
};

export default FeedbackList;
