import PropTypes from 'prop-types';
import Button from './Button';

const SupplierDisplay = ({ supplier, onEdit }) => {
  if (!supplier) return null;

  // Format address with proper comma handling
  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    
    // Add street if it exists
    if (address.street) {
      parts.push(address.street);
    }
    
    // Add zip code and city together if they exist
    const cityPart = [];
    if (address.zip_code) cityPart.push(address.zip_code);
    if (address.city) cityPart.push(address.city);
    if (cityPart.length > 0) {
      parts.push(cityPart.join(' '));
    }
    
    // Add country if it exists
    if (address.country) {
      parts.push(address.country);
    }
    
    return parts.join(', ');
  };

  return (
    <div className="glass-card p-8 md:p-10">
      <div className="flex justify-between items-start">
        <div>
          <small className="text-gray-400">Company / Supplier</small>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{supplier.name}</h2>
          <p className="text-gray-600">
            {formatAddress(supplier.address)}
          </p>
        </div>
        <Button onClick={onEdit} variant="secondary" size="medium">Edit</Button>
      </div>
    </div>
  );
};

SupplierDisplay.propTypes = {
  supplier: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
};

export default SupplierDisplay;
