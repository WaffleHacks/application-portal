import React, { ReactNode } from 'react';

export interface Props {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema?: any;
  children: ReactNode;
}

const Step = ({ children }: Props): JSX.Element => <>{children}</>;

export default Step;
