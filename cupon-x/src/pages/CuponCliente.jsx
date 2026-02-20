import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaCupones from "../components/VistaCupones";
import { getAuthSession } from '../services/api';

export default function CuponeCliente() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.token) navigate('/login');
  }, [navigate]);

  return (
    <div className="container my-4">
      <VistaCupones />
    </div>
  );
}
