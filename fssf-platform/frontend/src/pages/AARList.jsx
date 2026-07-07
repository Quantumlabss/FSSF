import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const OUTCOME_TAG = { success: 'fssf-tag--ok', failure: 'fssf-tag--danger', partial: 'fssf-tag--warn' };

export default function AARList() {
  const { hasRole } = useAuth();
  const [aars, setAars] = useState([]);

  useEffect(() => { api.get('/aars').then((res) => setAars(res.data.aars)); }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-end">
        <div>
          <div className="fssf-section-label">Debrief</div>
          <h1 className="mb-0">After Action Reports</h1>
        </div>
        {hasRole('nco') && <Link to="/aars/new" className="btn btn-fssf btn-sm">New AAR</Link>}
      </div>

      <div className="row g-4 mt-2">
        {aars.map((a) => (
          <div className="col-md-6" key={a.id}>
            <Link to={`/aars/${a.id}`} className="text-decoration-none">
              <div className="fssf-card card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{a.title}</h5>
                  {a.outcome && <span className={`fssf-tag ${OUTCOME_TAG[a.outcome] || ''}`}>{a.outcome}</span>}
                </div>
                <p style={{ opacity: 0.85 }}>{a.summary || a.bodyMarkdown.slice(0, 140)}</p>
                <small className="fssf-mono opacity-75">
                  {a.author?.callsign || a.author?.username} · {new Date(a.createdAt).toLocaleDateString()}
                </small>
              </div>
            </Link>
          </div>
        ))}
        {!aars.length && <p className="fssf-mono opacity-75">No AARs published yet.</p>}
      </div>
    </div>
  );
}
