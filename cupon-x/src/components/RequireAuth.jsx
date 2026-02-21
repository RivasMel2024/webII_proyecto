import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

export default function RequireAuth({ children }) {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
