import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUsers, FaBox, FaShoppingBag } from 'react-icons/fa';

const Navigation = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaShoppingCart className="me-2" />
          E-Commerce App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/customers">
              <FaUsers className="me-1" /> Customers
            </Nav.Link>
            <Nav.Link as={Link} to="/products">
              <FaBox className="me-1" /> Products
            </Nav.Link>
            <Nav.Link as={Link} to="/orders/new">
              <FaShoppingBag className="me-1" /> New Order
            </Nav.Link>
            <Nav.Link as={Link} to="/orders/history">
              <FaShoppingBag className="me-1" /> Order History
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
