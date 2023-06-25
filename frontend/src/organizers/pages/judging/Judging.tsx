import React, { useState } from 'react';

import DownloadStep from './DownloadStep';
import ProcessingStep from './ProcessingStep';
import SelectFieldsStep from './SelectFieldsStep';
import Steps from './Steps';
import UploadStep from './UploadStep';

const Judging = (): JSX.Element => {
  const [{ current, file }, setCurrent] = useState({ current: 0, file: '' });

  const next = (file?: string) => setCurrent((step) => ({ current: step.current + 1, file: file || step.file }));

  return (
    <>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Validate and format the DevPost project export for judging</p>
        </div>
      </div>

      <Steps current={current} />

      <div className="mt-4">
        {current === 0 && <UploadStep next={next} />}
        {current === 1 && <SelectFieldsStep next={next} file={file} />}
        {current === 2 && <ProcessingStep next={next} file={file} />}
        {current === 3 && <DownloadStep file={file} />}
      </div>
    </>
  );
};

export default Judging;
