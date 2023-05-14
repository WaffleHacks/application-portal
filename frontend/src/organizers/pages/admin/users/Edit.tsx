import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Form, Formik } from 'formik';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { Button, LinkButton } from 'components/buttons';
import { SelectInput, SwitchInput } from 'components/input';
import { Description, Section } from 'organizers/components/description';
import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { useGetParticipantQuery, useUpdateParticipantPermissionsMutation } from 'store';
import { Role } from 'store/types';

const validationSchema = Yup.object({
  role: Yup.string().required('This field is required').oneOf(Object.values(Role), 'You must select an option'),
  is_admin: Yup.boolean(),
});

const Edit = (): JSX.Element => {
  const { id: idString } = useParams();
  const id = parseInt(idString as string);
  const navigate = useNavigate();

  const { data, isLoading } = useGetParticipantQuery(id);
  const [updatePermissions, { isLoading: isSubmitting, isSuccess }] = useUpdateParticipantPermissionsMutation();

  useEffect(() => {
    if (!isSubmitting && isSuccess) navigate('/users');
  }, [isSuccess, isSubmitting]);

  if (isLoading) return <Loading />;
  if (!data) return <NotFound message="We couldn't find that user" returnTo="/users" />;

  return (
    <Formik
      initialValues={{ role: data.role, is_admin: data.is_admin }}
      onSubmit={(values) => updatePermissions({ ...values, id })}
      validationSchema={validationSchema}
      validateOnChange={true}
    >
      {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
        <Form>
          <Description
            title={`Edit permissions of ${data.first_name} ${data.last_name} (${data.email})`}
            subtitle="Change what the user has access to"
          >
            <Section>
              <SelectInput label="Role" required {...getFieldProps('role')}>
                <option value={Role.Participant}>Participant</option>
                <option value={Role.Sponsor}>Sponsor</option>
                <option value={Role.Organizer}>Organizer</option>
              </SelectInput>
              <SwitchInput
                label="Admin?"
                required
                description="Whether the user should be an admin."
                {...getFieldProps('is_admin')}
              />
            </Section>

            <Section>
              <div className="flex justify-between col-span-3">
                <LinkButton to="/users">
                  <ArrowLeftIcon className="h-4 w-5 mr-2" aria-hidden="true" />
                  Back
                </LinkButton>
                <Button type="submit" style="success" disabled={!isValid || isSubmitting || isFormikSubmitting}>
                  {isSubmitting || isFormikSubmitting ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </Section>
          </Description>
        </Form>
      )}
    </Formik>
  );
};

export default Edit;
