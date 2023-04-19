import { RefreshIcon } from '@heroicons/react/outline';
import { Form, Formik } from 'formik';
import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

import { Button } from '../../components/buttons';
import Card from '../../components/Card';
import { ReadOnlyTextInput, TextInput } from '../../components/input';
import { useCurrentUserQuery, useUpdateProfileMutation } from '../../store';

const validationSchema = Yup.object({
  first_name: Yup.string().required('This field is required'),
  last_name: Yup.string().required('This field is required'),
});

const Profile = (): JSX.Element => {
  const { data: me } = useCurrentUserQuery();
  const [submit, { isLoading, isSuccess }] = useUpdateProfileMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) toast.success('Successfully updated your profile');
  }, [isLoading, isSuccess]);

  if (!me?.participant) return <></>;
  const { email, first_name, last_name } = me.participant;

  return (
    <Card>
      <Formik
        initialValues={{ first_name, last_name }}
        onSubmit={(values) => submit(values)}
        validationSchema={validationSchema}
        validateOnChange={true}
      >
        {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 max-w-xl">
                <ReadOnlyTextInput id="email" label="Your email" value={email} />
              </div>
              <TextInput label="Given name" autoComplete="given-name" required {...getFieldProps('first_name')} />
              <TextInput label="Family name" autoComplete="family-name" required {...getFieldProps('last_name')} />
            </div>
            <Button
              className="mt-6"
              type="submit"
              style="success"
              disabled={!isValid || isFormikSubmitting || isLoading}
            >
              {isFormikSubmitting || isLoading ? (
                <RefreshIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                'Save'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default Profile;
