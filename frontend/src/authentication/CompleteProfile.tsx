import { RefreshIcon } from '@heroicons/react/outline';
import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { Button } from '../components/buttons';
import { TextInput } from '../components/input';
import { useCompleteProfileMutation, useCurrentUserQuery } from '../store';
import Layout from './components/Layout';

interface Values {
  first_name: string;
  last_name: string;
}

const initialValues: Values = {
  first_name: '',
  last_name: '',
};

const validationSchema = Yup.object({
  first_name: Yup.string().required('This field is required'),
  last_name: Yup.string().required('This field is required'),
});

const CompleteProfile = (): JSX.Element => {
  const { data: me, isLoading } = useCurrentUserQuery();
  const [submit, { isLoading: isSubmitting }] = useCompleteProfileMutation();

  if (isLoading || !me) return <></>;

  const email = me.email;
  if (!email) throw new Error('Email must not be null');

  return (
    <Layout title="Complete your profile">
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => submit(values)}
        validationSchema={validationSchema}
        validateOnChange={true}
      >
        {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
          <Form>
            <ReadOnlyText id="email" label="Your email" value={email} />
            <TextInput
              className="mt-4"
              label="What is your given (or 'first') name?"
              autoComplete="given-name"
              required
              {...getFieldProps('first_name')}
            />
            <TextInput
              className="mt-4"
              label="What is your family (or 'last') name?"
              autoComplete="family-name"
              required
              {...getFieldProps('last_name')}
            />
            <Button
              className="mt-4 w-full justify-center"
              type="submit"
              style="success"
              disabled={!isValid || isSubmitting || isFormikSubmitting}
            >
              {isSubmitting || isFormikSubmitting ? (
                <RefreshIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                'Save'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

interface ReadOnlyTextProps {
  id: string;
  label: string;
  value: string;
}

const ReadOnlyText = ({ id, label, value }: ReadOnlyTextProps): JSX.Element => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} (read only)
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        type="text"
        id={id}
        className="bg-gray-100 border-gray-300 block w-full shadow-sm sm:text-sm rounded-md"
        disabled
        value={value}
      />
    </div>
  </div>
);

export default CompleteProfile;
