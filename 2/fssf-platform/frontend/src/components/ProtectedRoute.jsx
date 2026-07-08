import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap a route element: <ProtectedRoute role="nco"><AdminPage/></ProtectedRoute>
export default function ProtectedRoute({ children, role = 'recruit' }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) return <div className="container py-5 text-center fssf-mono">Loading credentials…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!hasRole(role)) {
    return (
      <div className="container py-5">
        <div className="fssf-card card p-4">
          <h3>Access Denied</h3>
          <p className="mb-0">Your clearance level does not permit access to this page.</p>
        </div>
      </div>
    );
  }
  return children;
}
