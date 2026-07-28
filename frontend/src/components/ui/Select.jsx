import React from 'react';
import { Form } from 'react-bootstrap';

const Select = ({
  label,
  name,
  value,
  options = [],
  onChange,
  onBlur,
  error,
  touched,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  className = '',
}) => {
  const isInvalid = touched && error;

  return (
    <Form.Group className={`mb-3 ${className}`}>
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <Form.Select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        isInvalid={isInvalid}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
      {isInvalid && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default Select;
