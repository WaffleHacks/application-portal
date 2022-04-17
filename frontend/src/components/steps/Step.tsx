import React, { ReactNode } from 'react';

export interface Props {
  title: string;
  canTransition?: () => boolean;
  children: ReactNode;
}

const Step = ({ children }: Props): JSX.Element => <>{children}</>;

export default Step;
