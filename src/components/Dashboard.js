import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Card } from 'react-bootstrap';
import CustomerManagement from './customers/CustomerManagement';
import ProductManagement from './products/ProductManagement';
import OrderManagement from './orders/OrderManagement';

const Dashboard = () => {
  const [key, setKey] = useState('customers');

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h1 className="mb-0">E-Commerce Dashboard</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs
                id="dashboard-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
              >
                <Tab eventKey="customers" title="Customers">
                  <CustomerManagement />
                </Tab>
                <Tab eventKey="products" title="Products">
                  <ProductManagement />
                </Tab>
                <Tab eventKey="orders" title="Orders">
                  <OrderManagement />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
