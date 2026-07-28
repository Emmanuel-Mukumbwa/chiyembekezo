import React from 'react';
import { Form } from 'react-bootstrap';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...rest
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
      <Form.Control
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={isInvalid}
        {...rest}
      />
      {isInvalid && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default Input;
