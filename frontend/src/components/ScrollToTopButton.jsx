import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    isVisible && (
      <Button
        variant="primary"
        onClick={scrollToTop}
        className="rounded-circle shadow-lg"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          transition: 'opacity 0.3s ease',
        }}
        aria-label="Back to top"
      >
        <FaArrowUp />
      </Button>
    )
  );
};

export default ScrollToTopButton;
