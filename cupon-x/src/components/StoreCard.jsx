import React from 'react';
import { Card } from 'react-bootstrap';

const StoreCard = ({ store }) => {
  return (
    <Card className="store-card h-100">
      {/* Representación visual de la marca con CSS puro */}
      <div className="store-brand-display" style={{ backgroundColor: store.bgColor }}>
        <span className="store-brand-initials">{store.name}</span>
      </div>
      
      <Card.Body className="p-3">
        <Card.Title className="store-name-text">{store.name}</Card.Title>
        <div className="store-reward-badge">
          <span className="reward-dot"></span>
          Upto {store.reward} Voucher Rewards
        </div>
      </Card.Body>
    </Card>
  );
};

export default StoreCard;