import React from 'react';

import Badge, { Color } from '../../components/Badge';
import { Status } from '../../store';

interface Props {
  status: Status;
  large?: boolean;
}

const statusToColor: Record<Status, Color> = {
  [Status.Pending]: 'yellow',
  [Status.Accepted]: 'green',
  [Status.Rejected]: 'red',
};

const StatusBadge = ({ large = false, status }: Props): JSX.Element => (
  <Badge large={large} color={statusToColor[status]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

export default StatusBadge;
