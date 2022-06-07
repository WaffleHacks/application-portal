import { ArrowLeftIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '../../../components/buttons';
import Confirm from '../../../components/Confirm';
import { useMergeSchoolsMutation } from '../../../store';
import { Description, Section } from '../../components/description';
import Search, { SearchItem } from './Search';

const getInitial = (params: URLSearchParams): SearchItem | undefined => {
  const id = params.get('id');
  const name = params.get('name');

  if (id === null || name === null) return undefined;
  else return { objectID: id, name: decodeURIComponent(name) };
};

const Merge = (): JSX.Element => {
  const [query] = useSearchParams();
  const navigate = useNavigate();

  const [from, setFrom] = useState<SearchItem | undefined>(getInitial(query));
  const [into, setInto] = useState<SearchItem | undefined>();

  const [merge, { isLoading, isSuccess }] = useMergeSchoolsMutation();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isSuccess) {
      navigate(`/schools/${into?.objectID}`);
      toast.success('Successfully merged schools');
    }
  }, [isLoading, isSuccess]);

  return (
    <>
      <Confirm
        isOpen={isOpen}
        close={() => setOpen(false)}
        onClick={() => merge({ from: from?.objectID as string, into: into?.objectID as string })}
        title={`Merge "${from?.name}" into "${into?.name}"?`}
        description="Are you sure you want to merge these two schools? This action is irreversible, however, no data will be lost."
      />

      <Description title="Merge Schools" subtitle="Combine the data of 2 schools into 1 to consolidate duplicates.">
        <div className="grid grid-cols-1  sm:grid-cols-2 border-t border-gray-200 px-4 py-5 sm:px-6">
          <Search label="From" onClick={setFrom} value={from} />
          <Search label="Into" onClick={setInto} value={into} />
        </div>
        <Section>
          <div className="col-span-3 flex justify-between">
            <Button type="button" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-4 w-5 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              style="success"
              disabled={from === undefined || into === undefined}
              onClick={() => setOpen(true)}
            >
              Merge
            </Button>
          </div>
        </Section>
      </Description>
    </>
  );
};

export default Merge;
