import { Navigate, useLocation } from 'react-router-dom';
import { consumeAuthNotice, isAuthenticated } from '../services/api';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const authNotice = consumeAuthNotice();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location, authNotice }} replace />;
  }

  return children;
}
