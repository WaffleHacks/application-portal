import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Formik, Form as FormikForm } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { Button, LinkButton } from '../../../../components/buttons';
import { SwitchInput, TextInput } from '../../../../components/input';
import { ProviderWithClientSecret } from '../../../../store/types';
import { Description, NamedSection, Section } from '../../../components/description';

interface Props {
  canEditSlug?: boolean;
  returnTo: string;

  values?: ProviderWithClientSecret;
  onSubmit: (provider: ProviderWithClientSecret) => void;
  isSubmitting: boolean;

  title: string;
  subtitle?: string;
}

const initialValues: ProviderWithClientSecret = {
  slug: '',
  name: '',
  icon: '',
  enabled: false,
  client_id: '',
  client_secret: '',
  scope: '',
  authorization_endpoint: '',
  token_endpoint: '',
  user_info_endpoint: '',
};

const validationSchema = Yup.object({
  slug: Yup.string().required('This field is required').lowercase('Must be lowercase'),
  name: Yup.string().required('This field is required'),
  icon: Yup.string().required('This field is required').url('Must be a URL'),
  enabled: Yup.boolean(),
  client_id: Yup.string().required('This field is required'),
  client_secret: Yup.string(),
  scope: Yup.string(),
  authorization_endpoint: Yup.string().required('This field is required').url('Must be a URL'),
  token_endpoint: Yup.string().required('This field is required').url('Must be a URL'),
  user_info_endpoint: Yup.string().required('This field is required').url('Must be a URL'),
});

const Form = ({
  canEditSlug = true,
  returnTo,
  values = initialValues,
  onSubmit,
  isSubmitting,
  title,
  subtitle,
}: Props): JSX.Element => (
  <Formik
    initialValues={values}
    onSubmit={onSubmit}
    validationSchema={validationSchema}
    validateOnMount={true}
    validateOnChange={true}
  >
    {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
      <FormikForm>
        <Description title={title} subtitle={subtitle}>
          <Section>
            <TextInput label="Name" required autoComplete="off" {...getFieldProps('name')} />
            {canEditSlug && <TextInput label="Slug" required autoComplete="off" {...getFieldProps('slug')} />}
            <TextInput label="Icon URL" required autoComplete="off" {...getFieldProps('icon')} />
            <SwitchInput
              className="max-w-xs"
              label="Enabled?"
              required
              description="Allow participants to login with this provider"
              {...getFieldProps('enabled')}
            />
          </Section>

          <NamedSection name="Configuration">
            <TextInput label="Client ID" required autoComplete="off" {...getFieldProps('client_id')} />
            <TextInput label="Client Secret" password autoComplete="off" {...getFieldProps('client_secret')} />
            <TextInput label="Scopes" autoComplete="off" {...getFieldProps('scope')} />
          </NamedSection>

          <NamedSection name="URLs">
            <TextInput
              label="Authorization Endpoint"
              required
              autoComplete="off"
              {...getFieldProps('authorization_endpoint')}
            />
            <TextInput label="Token Endpoint" required autoComplete="off" {...getFieldProps('token_endpoint')} />
            <TextInput
              label="User Info Endpoint"
              required
              autoComplete="off"
              {...getFieldProps('user_info_endpoint')}
            />
          </NamedSection>

          <Section>
            <div className="flex justify-between col-span-3">
              <LinkButton to={returnTo}>
                <ArrowLeftIcon className="h-4 w-5 mr-2" aria-hidden="true" />
                Back
              </LinkButton>
              <Button type="submit" style="success" disabled={!isValid || isSubmitting || isFormikSubmitting}>
                {isSubmitting || isFormikSubmitting ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </Section>
        </Description>
      </FormikForm>
    )}
  </Formik>
);

export default Form;
