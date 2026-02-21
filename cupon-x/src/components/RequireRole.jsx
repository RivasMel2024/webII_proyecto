import { Navigate, useLocation } from 'react-router-dom';
import { getAuthUser } from '../services/api';

export default function RequireRole({ children, allowedRoles }) {
  const location = useLocation();
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
