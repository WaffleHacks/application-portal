import React, { ReactElement, useState } from 'react';

import Button from '../Button';
import Progress from './Progress';
import { Props as StepProps } from './Step';

interface Props {
  initialStep?: number;
  children: ReactElement<StepProps>[];
}

const MultiStep = ({ initialStep = 0, children }: Props): JSX.Element => {
  const [step, setStep] = useState(initialStep);

  const titles = children.map((c) => c.props.title);
  const currentStep = children[step];
  const canTransition = currentStep.props.canTransition;

  const nextStep = () => {
    if (canTransition && !canTransition()) return;
    else if (step !== children.length - 1) setStep(step + 1);
  };
  const previousStep = () => setStep(step === 0 ? 0 : step - 1);

  return (
    <>
      <Progress steps={titles} current={step} jump={setStep} />
      <div className="mt-4">{currentStep}</div>
      <div className="mt-4 flex justify-between">
        <Button style="secondary" onClick={previousStep} disabled={step === 0}>
          Previous
        </Button>
        <Button
          type={step === children.length - 1 ? 'submit' : 'button'}
          style={step === children.length - 1 ? 'success' : 'primary'}
          onClick={nextStep}
          disabled={canTransition && !canTransition()}
        >
          {step === children.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </>
  );
};

export default MultiStep;
