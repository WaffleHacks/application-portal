import { RefreshIcon } from '@heroicons/react/outline';
import { Formik, Form as FormikForm } from 'formik';
import React, { useEffect } from 'react';
import * as Yup from 'yup';

import { Button } from '../../../components/buttons';
import { LongTextInput, SwitchInput } from '../../../components/input';
import Rating from '../../../components/input/Rating';
import { useSubmitFeedbackMutation } from '../../../store';

interface Values {
  presentation: number;
  content: number;
  interest: number;
  again: boolean;
  comments: string;
}

const initialValues: Values = {
  presentation: 0,
  content: 0,
  interest: 0,
  again: true,
  comments: '',
};

interface Props {
  code: string;
  refetch: () => void;
}

const validationSchema = Yup.object({
  presentation: Yup.number().required().min(1, 'This field is required').max(5, 'Cannot rate more than 5 stars'),
  content: Yup.number().required().min(1, 'This field is required').max(5, 'Cannot rate more than 5 stars'),
  interest: Yup.number().required().min(1, 'This field is required').max(5, 'Cannot rate more than 5 stars'),
  again: Yup.boolean().required(),
  comments: Yup.string(),
});

const Form = ({ code, refetch }: Props): JSX.Element => {
  const [submit, { isLoading, isSuccess }] = useSubmitFeedbackMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) refetch();
  }, [isLoading, isSuccess]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(v: Values) => submit({ ...v, code })}
      validationSchema={validationSchema}
      validateOnChange
      validateOnMount
    >
      {({ getFieldProps, isValid, isSubmitting }) => (
        <FormikForm className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Rating label="Presentation" required {...getFieldProps('presentation')} />
            <Rating label="Content" required {...getFieldProps('content')} />
            <Rating label="Engagement" required {...getFieldProps('interest')} />
          </div>

          <div className="max-w-lg">
            <SwitchInput
              label="Should we do this event next year?"
              description="Maybe you liked this event so much that you want to see it again. Or, maybe you didn't find it that interesting and want to see something else instead."
              {...getFieldProps('again')}
            />
          </div>

          <div className="max-w-2xl">
            <LongTextInput label="Comments" {...getFieldProps('comments')} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" style="success" disabled={!isValid}>
              {isSubmitting || isLoading ? (
                <RefreshIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </FormikForm>
      )}
    </Formik>
  );
};

export default Form;
