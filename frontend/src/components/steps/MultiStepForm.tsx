import { Form, Formik, FormikValues } from 'formik';
import React, { ReactElement, useState } from 'react';

import Button from '../Button';
import AutoSave from './AutoSave';
import Progress from './Progress';
import { Props as StepProps } from './Step';

interface Props<Values extends FormikValues> {
  initialValues: Values;
  onSubmit: (values: Values) => void | Promise<void>;
  onAutosave?: (values: Values) => void | Promise<void>;
  initialStep?: number;
  children: ReactElement<StepProps>[];
}

const MultiStepForm = <Values,>({
  initialValues,
  onSubmit,
  onAutosave,
  initialStep = 0,
  children,
}: Props<Values>): JSX.Element => {
  const [step, setStep] = useState(initialStep);

  const titles = children.map((c) => c.props.title);
  const currentStep = children[step];

  const nextStep = () => setStep(Math.min(step + 1, children.length - 1));
  const previousStep = () => setStep(Math.max(step - 1, 0));

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={currentStep.props.validationSchema}
      validateOnChange={true}
      validateOnMount={true}
    >
      {(formik) => (
        <Form>
          <Progress steps={titles} current={step} jump={setStep} />
          <div className="mt-4">{currentStep}</div>
          <div className="mt-4 flex justify-around md:justify-between">
            <Button style="secondary" onClick={previousStep} disabled={step === 0}>
              Previous
            </Button>
            {onAutosave && <AutoSave onSave={onAutosave} debounce={500} />}
            <Button
              type={step === children.length - 1 ? 'submit' : 'button'}
              style={step === children.length - 1 ? 'success' : 'primary'}
              onClick={nextStep}
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {step === children.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MultiStepForm;
