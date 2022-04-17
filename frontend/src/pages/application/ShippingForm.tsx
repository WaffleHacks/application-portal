import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';

import { TextInput } from '../../components/input';
import SidebarCard from '../../components/SidebarCard';
import { FormFields } from './form';

const ShippingForm = (): JSX.Element => {
  const { getFieldProps, setFieldValue, values } = useFormikContext<FormFields>();
  const { ref } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    options: {
      fields: ['address_components'],
      types: ['address'],
    },
    onPlaceSelected: (place) => {
      setFieldValue(
        'street',
        `${getAddressComponent(place, 'street_number')} ${getAddressComponent(place, 'route')}`,
        true,
      );
      setFieldValue('city', getAddressComponent(place, 'locality'), true);
      setFieldValue('region', getAddressComponent(place, 'administrative_area_level_1'), true);
      setFieldValue('postalCode', getAddressComponent(place, 'postal_code'), true);
      setFieldValue('country', getAddressComponent(place, 'country'), true);
    },
  });

  useEffect(() => {
    if (ref.current) ref.current.value = values.street;
  }, [values.street]);

  return (
    <SidebarCard
      title="Shipping"
      description="We'll use this to send you some swag, in addition to any prizes you win. Please make sure to use an address where you can receive mail."
    >
      <div className="col-span-6 sm:col-span-4">
        <label htmlFor="street-address" className="block text-sm font-medium text-gray-700">
          Street address <span className="text-red-500">*</span>
        </label>
        <input
          ref={ref}
          type="text"
          id="street-address"
          autoComplete="street-address"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <TextInput className="col-span-6 sm:col-span-2" label="Apartment / Suite" {...getFieldProps('apartment')} />

      <TextInput
        className="col-span-6 sm:col-span-6 lg:col-span-2"
        label="City"
        required
        autoComplete="address-level2"
        {...getFieldProps('city')}
      />

      <TextInput
        className="col-span-6 sm:col-span-3 lg:col-span-2"
        label="State / Province"
        required
        autoComplete="address-level1"
        {...getFieldProps('region')}
      />

      <TextInput
        className="col-span-6 sm:col-span-3 lg:col-span-2"
        label="ZIP / Postal code"
        required
        autoComplete="postal-code"
        {...getFieldProps('postalCode')}
      />

      <TextInput
        className="col-span-6 sm:col-span-3"
        label="Country"
        autoComplete="country-name"
        required
        {...getFieldProps('country')}
      />
    </SidebarCard>
  );
};

const addressNameFormat: Record<string, 'short_name' | 'long_name'> = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name',
};

const getAddressComponent = (place: google.maps.places.PlaceResult, type: string): string => {
  for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
    if (component.types[0] === type) return component[addressNameFormat[type]];
  }

  return '';
};

export default ShippingForm;
