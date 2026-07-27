import React from 'react';
import { Button as BsButton } from 'react-bootstrap';

const Button = ({
  variant = 'primary',
  size,
  className = '',
  children,
  as = 'button',
  ...rest
}) => {
  const variantMap = {
    'primary': 'primary',
    'secondary': 'secondary',
    'success': 'success',
    'danger': 'danger',
    'warning': 'warning',
    'outline-primary': 'outline-primary',
    'outline-secondary': 'outline-secondary',
    'ghost': 'outline-secondary',
    'emergency': 'danger',
  };
  const bootstrapVariant = variantMap[variant] || variant;
  const extraClass = variant === 'soft' ? 'btn-soft' : '';
  return (
    <BsButton
      variant={bootstrapVariant}
      size={size}
      className={`btn-chiya rounded-pill fw-semibold ${extraClass} ${className}`}
      as={as}
      {...rest}
    >
      {children}
    </BsButton>
  );
};

export default Button;
