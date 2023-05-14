import React from 'react';

import Badge, { Color } from 'components/Badge';
import { ApplicationStatus } from 'store';

interface Props {
  status: ApplicationStatus;
  large?: boolean;
}

const statusToColor: Record<ApplicationStatus, Color> = {
  [ApplicationStatus.Pending]: 'yellow',
  [ApplicationStatus.Accepted]: 'green',
  [ApplicationStatus.Rejected]: 'red',
};

const StatusBadge = ({ large = false, status }: Props): JSX.Element => (
  <Badge large={large} color={statusToColor[status]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

export default StatusBadge;
