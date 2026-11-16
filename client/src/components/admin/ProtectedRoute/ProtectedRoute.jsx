import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../ui/Spinner/Spinner';

/** Lejon hyrjen në /admin vetëm nëse administratori është i kyçur. */
export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <Spinner />;
  if (!user) return <Navigate to="/admin/hyrje" replace state={{ from: location.pathname }} />;
  return children;
}
