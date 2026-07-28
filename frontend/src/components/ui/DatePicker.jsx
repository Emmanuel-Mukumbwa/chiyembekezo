import React from 'react';
import { Form } from 'react-bootstrap';

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
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
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
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

export default DatePicker;
