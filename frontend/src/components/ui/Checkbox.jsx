import React from 'react';
import { Form } from 'react-bootstrap';

const Checkbox = ({
  label,
  name,
  checked,
  onChange,
  error,
  touched,
  disabled = false,
  className = '',
}) => {
  const isInvalid = touched && error;

  return (
    <Form.Group className={`mb-3 ${className}`}>
      <Form.Check
        type="checkbox"
        id={name}
        name={name}
        label={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        isInvalid={isInvalid}
        feedback={error}
      />
    </Form.Group>
  );
};

export default Checkbox;
