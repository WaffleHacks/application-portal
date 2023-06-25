import React, { ReactNode } from 'react';

import Badge from 'components/Badge';
import { LinkButton } from 'components/buttons';
import Card from 'components/Card';
import Loading from 'organizers/components/Loading';
import { useGetJudgingProcessResultQuery } from 'store';

interface Props {
  file: string;
}

const DownloadStep = ({ file }: Props): JSX.Element => {
  const { data, isLoading } = useGetJudgingProcessResultQuery(file);

  if (isLoading || data === undefined) return <Loading />;
  else if (data.status === 'failure') {
    return (
      <Layout>
        <p className="mt-2 text-md gray-600">
          Status: <Badge color="red">Failure</Badge>
        </p>
      </Layout>
    );
  } else {
    return (
      <Layout>
        <p className="mt-2 text-md gray-600">
          Status: <Badge color="green">Success</Badge>
        </p>
        <div className="flex gap-4">
          <LinkButton to={data.valid} external style="secondary">
            Download valid projects
          </LinkButton>
          <LinkButton to={data.invalid} external style="secondary">
            Download invalid projects
          </LinkButton>
        </div>
      </Layout>
    );
  }
};

export default DownloadStep;

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps): JSX.Element => (
  <Card>
    <h3 className="text-lg font-semibold leading-8 text-gray-700">Processing Complete!</h3>
    <div className="max-w-4xl space-y-4">{children}</div>
  </Card>
);
