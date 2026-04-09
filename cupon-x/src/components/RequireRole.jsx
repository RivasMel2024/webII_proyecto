import { Navigate, useLocation } from 'react-router-dom';
import { consumeAuthNotice, getAuthUser, isAuthenticated } from '../services/api';

export default function RequireRole({ children, allowedRoles }) {
  const location = useLocation();
  const authNotice = consumeAuthNotice();
  const user = getAuthUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" state={{ from: location, authNotice }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
