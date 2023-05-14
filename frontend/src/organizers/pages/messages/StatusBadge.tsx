import React from 'react';

import Badge from 'components/Badge';
import { MessageStatus } from 'store';

const color = (status: MessageStatus): 'yellow' | 'green' | 'red' => {
  switch (status) {
    case MessageStatus.Draft:
      return 'yellow';
    case MessageStatus.Ready:
      return 'green';
    case MessageStatus.Sending:
    case MessageStatus.Sent:
      return 'red';
  }
};

interface Props {
  status: MessageStatus;
}

const StatusBadge = ({ status }: Props): JSX.Element => <Badge color={color(status)}>{status}</Badge>;

export default StatusBadge;
