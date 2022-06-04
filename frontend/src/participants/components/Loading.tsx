import { RefreshIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import React from 'react';

import Card from '../../components/Card';

interface Props {
  className?: string;
}

const Loading = ({ className }: Props): JSX.Element => (
  <Card className={classNames('flex justify-around', className)}>
    <RefreshIcon className="h-8 w-8 animate-spin" />
  </Card>
);

export default Loading;
