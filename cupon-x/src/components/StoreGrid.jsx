import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import StoreCard from './StoreCard';
import '../styles/storegrid.css';

const TopStores = () => {
  const [stores] = useState([
    { id: 1, name: 'Amazon', reward: '58%', bgColor: '#232f3e' },
    { id: 2, name: 'Canon', reward: '45.7%', bgColor: '#ed1c24' },
    { id: 3, name: 'FedEx', reward: '45.7%', bgColor: '#4d148c' },
    { id: 4, name: 'Microsoft', reward: '45.7%', bgColor: '#00a4ef' },
    { id: 5, name: 'Siemens', reward: '45.7%', bgColor: '#009999' },
    { id: 6, name: 'Meta', reward: '45.7%', bgColor: '#0668E1' },
  ]);

  return (
    <section className="top-stores-section">
      <Container>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 className="section-title">Top <span className="highlight">Stores</span></h2>
          <a href="#all" className="see-all-link">See All Stores</a>
        </div>

        <Row className="g-3">
          {stores.map((store) => (
            <Col key={store.id} lg={2} md={4} sm={6} xs={6}>
              <StoreCard store={store} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default TopStores;