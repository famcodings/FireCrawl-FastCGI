import PropTypes from 'prop-types';

/**
 * Reusable form field component with consistent styling
 * Supports both input and select field types
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  options = null,
  defaultOption = null,
  className = '',
  ...props
}) => {
  const baseClasses = 'glass-input w-full py-3 px-3 text-base';
  const fieldClasses = `${baseClasses} ${className}`;

  const renderField = () => {
    if (type === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={fieldClasses}
          {...props}
        >
          {defaultOption && (
            <option value="">{defaultOption}</option>
          )}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={fieldClasses}
        {...props}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={name} 
        className="block text-sm font-semibold text-gray-700 tracking-wide uppercase"
      >
        {label} {required && '*'}
      </label>
      {renderField()}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'tel', 'url', 'select']),
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.string),
  defaultOption: PropTypes.string,
  className: PropTypes.string,
};

export default FormField;
