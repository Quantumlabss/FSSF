import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Discord redirects to /api/auth/discord/callback (backend), which sets the
// session cookie and then bounces the browser here.
export default function LoginCallback() {
  const { refresh } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refresh().then(() => navigate('/'));
  }, []);

  return <div className="container py-5 text-center fssf-mono opacity-75">Verifying credentials…</div>;
}
