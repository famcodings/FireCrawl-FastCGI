/** Sidebar Header component for the application */
import PropTypes from 'prop-types';

const Header = ({
  appName = 'InfoBud PoC',
  version = '1.0.0',
  supplier,
  resources = []
}) => {
  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex mb-4">
          <img 
            src="/logos/logo-light.svg" 
            alt={appName} 
            className="h-12"
          />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Create supplier profiles and manage resources for intelligent business matching.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <h3 className="text-gray-800 font-semibold mb-4">Progress</h3>
        <div className="space-y-3">
          <div className={`flex items-center space-x-3 ${supplier ? 'text-gray-800' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${supplier ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={supplier ? {backgroundColor: '#ec6636'} : {}}>
              {supplier ? '✓' : '1'}
            </div>
            <span className="text-sm">Create Supplier</span>
          </div>
          <div className={`flex items-center space-x-3 ${supplier && resources.length > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${supplier && resources.length > 0 ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={supplier && resources.length > 0 ? {backgroundColor: '#ec6636'} : {}}>
              {supplier && resources.length > 0 ? '✓' : '2'}
            </div>
            <span className="text-sm">Add Resources</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">3</div>
            <span className="text-sm">Process & Analyze</span>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {supplier && (
        <div className="mb-8">
          <h3 className="text-gray-800 font-semibold mb-3">Current Supplier</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800 font-medium">{supplier.name}</p>
            <p className="text-gray-600 text-sm">
              {supplier.address?.city}, {supplier.address?.country}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {resources.length} resource{resources.length !== 1 ? 's' : ''} added
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {/* Start Over button removed for PoC - single supplier workflow */}
      </div>
    </div>
  );
};

Header.propTypes = {
  appName: PropTypes.string,
  version: PropTypes.string,
  supplier: PropTypes.object,
  resources: PropTypes.array
};

export default Header;