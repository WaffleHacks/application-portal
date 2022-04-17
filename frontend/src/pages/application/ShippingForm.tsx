import React, { useEffect } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';

import FormCard from '../../components/FormCard';
import { TextInput } from '../../components/input';

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
}

interface Props {
  value: ShippingAddress;
  setValue: (value: ShippingAddress) => void;
}

const ShippingForm = ({ value, setValue }: Props): JSX.Element => {
  const { ref } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    options: {
      fields: ['address_components'],
      types: ['address'],
    },
    onPlaceSelected: (place) =>
      setValue({
        street: `${getAddressComponent(place, 'street_number')} ${getAddressComponent(place, 'route')}`,
        apartment: value.apartment,
        city: getAddressComponent(place, 'locality'),
        region: getAddressComponent(place, 'administrative_area_level_1'),
        postal: getAddressComponent(place, 'postal_code'),
        country: getAddressComponent(place, 'country'),
      }),
  });

  useEffect(() => {
    if (ref.current) ref.current.value = value.street;
  }, [value.street]);

  return (
    <FormCard
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

      <TextInput
        className="col-span-6 sm:col-span-2"
        label="Apartment / Suite"
        value={value.apartment}
        onChange={(v) => setValue({ ...value, apartment: v })}
      />

      <TextInput
        className="col-span-6 sm:col-span-6 lg:col-span-2"
        label="City"
        value={value.city}
        onChange={(v) => setValue({ ...value, city: v })}
        required
        autoComplete="address-level2"
      />

      <TextInput
        className="col-span-6 sm:col-span-3 lg:col-span-2"
        label="State / Province"
        value={value.region}
        onChange={(v) => setValue({ ...value, region: v })}
        required
        autoComplete="address-level1"
      />

      <TextInput
        className="col-span-6 sm:col-span-3 lg:col-span-2"
        label="ZIP / Postal code"
        value={value.postal}
        onChange={(v) => setValue({ ...value, postal: v })}
        required
        autoComplete="postal-code"
      />

      <TextInput
        className="col-span-6 sm:col-span-3"
        label="Country"
        value={value.country}
        onChange={(v) => setValue({ ...value, country: v })}
        autoComplete="country-name"
        required
      />
    </FormCard>
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
