import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import FormField from './FormField';
import { COUNTRIES } from '../utils/countries';

const SupplierForm = ({ supplier, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    address: supplier?.address?.street || '',
    zip_code: supplier?.address?.zip_code || '',
    city: supplier?.address?.city || '',
    country: supplier?.address?.country || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
          Company / Supplier
        </h2>
        {!supplier && (
          <p className="text-gray-600 text-sm">
            Start by entering your company information.
          </p>
         )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormField
            label="Company Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter company name"
            disabled={isLoading || !!supplier}
            required
          />
          <span className="text-gray-600 text-xs mt-1 block">
            The company name cannot be changed later.
          </span>
        </div>

        <FormField
          label="Street Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street Address"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Zip Code"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            placeholder="Zip Code"
            disabled={isLoading}
          />
          <FormField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            disabled={isLoading}
            required
          />
        </div>
      
        <FormField
          label="Country"
          name="country"
          type="select"
          value={formData.country}
          onChange={handleChange}
          disabled={isLoading}
          options={COUNTRIES}
          defaultOption="Select a country"
          required
        />

        <div className="pt-4">
          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="medium"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};

SupplierForm.propTypes = {
  supplier: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default SupplierForm;