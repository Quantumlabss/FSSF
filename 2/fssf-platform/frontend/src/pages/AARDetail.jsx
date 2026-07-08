import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AARDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [aar, setAar] = useState(null);

  useEffect(() => { api.get(`/aars/${id}`).then((res) => setAar(res.data.aar)); }, [id]);

  if (!aar) return <div className="container py-5 fssf-mono opacity-75">Loading report…</div>;

  return (
    <div className="container py-5" style={{ maxWidth: '48rem' }}>
      <div className="fssf-section-label">{aar.outcome || 'debrief'}</div>
      <div className="d-flex justify-content-between align-items-start">
        <h1>{aar.title}</h1>
        {hasRole('nco') && <Link to={`/aars/${aar.id}/edit`} className="btn btn-fssf-outline btn-sm">Edit</Link>}
      </div>
      <p className="fssf-mono opacity-75">
        {aar.author?.callsign || aar.author?.username} · {new Date(aar.createdAt).toLocaleDateString()}
        {aar.event ? ` · ${aar.event.title}` : ''}
      </p>
      <div className="fssf-card card p-4 mt-3">
        <div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{aar.bodyMarkdown}</div>
      </div>
    </div>
  );
}
