import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <Form onSubmit={handleSubmit} className={className}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit" variant="outline-secondary">
          <FaSearch />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
