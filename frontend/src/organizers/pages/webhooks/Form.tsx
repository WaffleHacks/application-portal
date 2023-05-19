import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { Formik, Form as FormikForm, useField } from 'formik';
import React, { useId } from 'react';
import * as Yup from 'yup';

import { Button, LinkButton } from 'components/buttons';
import { SelectInput, TextInput } from 'components/input';
import { BaseProps } from 'components/input/common';
import { Description, NamedSection, Section } from 'organizers/components/description';
import { WebhookFormat, WebhookTriggers, WebhookWithSecret } from 'store/types';

type Values = Omit<WebhookWithSecret, 'id'>;

interface Props {
  returnTo: string;

  values?: Values;
  onSubmit: (webhook: Values) => void;
  isSubmitting: boolean;

  title: string;
  subtitle?: string;
}

const initialValues: Values = {
  format: WebhookFormat.JSON,
  triggered_by: 0,
  enabled: true,
  url: '',
  secret: '',
};

const validationSchema = Yup.object({
  url: Yup.string().required('This field is required').url('Must be a URL'),
  secret: Yup.string(),
  enabled: Yup.boolean(),
  format: Yup.string()
    .required('This field is required')
    .oneOf(Object.values(WebhookFormat), `Must be one of ${Object.values(WebhookFormat).join(', ')}`),
  triggered_by: Yup.number().required('This field is required'),
});

const Form = ({ returnTo, values = initialValues, onSubmit, isSubmitting, title, subtitle }: Props): JSX.Element => {
  return (
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
              <TextInput label="URL" required autoComplete="off" {...getFieldProps('url')} />
              <SelectInput label="Format" {...getFieldProps('format')}>
                {Object.values(WebhookFormat).map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </SelectInput>
              <TextInput label="Signing Secret" password autoComplete="off" {...getFieldProps('secret')} />
            </Section>

            <NamedSection name="Triggered By">
              {Object.entries(WebhookTriggers).map(([index, value]) => (
                <BitFlagToggle key={index} label={value} index={parseInt(index)} {...getFieldProps('triggered_by')} />
              ))}
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
};

type BitFlagToggleProps = BaseProps<number> & {
  index: number;
};

const BitFlagToggle = ({ label, index, ...props }: BitFlagToggleProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ value }, _, { setValue }] = useField(props);
  const { className, disabled, required } = props;
  const id = useId();

  return (
    <div className={classNames('flex items-center', className)}>
      <input
        id={id}
        type="checkboX"
        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        required={required}
        disabled={disabled}
        checked={(value & index) === index}
        onChange={() => setValue(value ^ index)}
      />
      <label htmlFor={id} className="ml-3 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default Form;
