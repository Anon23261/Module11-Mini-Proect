import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';

const Navigation = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaShoppingCart className="me-2" />
          E-Commerce App
        </Navbar.Brand>

      </Container>
    </Navbar>
  );
};

export default Navigation;
