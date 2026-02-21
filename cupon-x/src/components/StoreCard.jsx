import { Link } from "react-router-dom";
import "../styles/storedcard.css";

export default function StoreCard({ data }) {
  return (
    <Link to={`/stores/${data.id}`} className="store-card-link">
      <div className="store-card">
        <div className="store-card-top" style={{ backgroundColor: data.color }}>
          <span className="store-card-toptext">{data.nombre.toUpperCase()}</span>
        </div>

        <div className="store-card-body">
          <div className="store-card-name">{data.nombre}</div>
          <div className="store-card-rubro">{data.rubro}</div>
          <div className="store-card-desc">{data.descripcion}</div>

          <div className="store-card-reward">
            <span className="dot" />
            Upto {data.reward}% Voucher Rewards
          </div>
        </div>
      </div>
    </Link>
  );
}