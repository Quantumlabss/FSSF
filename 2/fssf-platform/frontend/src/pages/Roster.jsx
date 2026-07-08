import { useEffect, useState } from 'react';
import api from '../api/client';
import RankBadge from '../components/RankBadge';

export default function Roster() {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/roster').then((res) => setRoster(res.data.roster)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // live-ish refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-end">
        <div>
          <div className="fssf-section-label">Live Roster</div>
          <h1 className="mb-0">Force Roster</h1>
        </div>
        <span className="fssf-tag fssf-tag--ok">{roster.length} ACTIVE</span>
      </div>
      <p className="fssf-mono opacity-75 mt-2">Synced from Discord roles · auto-refreshes every 30s</p>

      <div className="table-responsive mt-3">
        <table className="table fssf-table align-middle">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Callsign</th>
              <th>Position</th>
              <th>Unit</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((m) => (
              <tr key={m.id}>
                <td><RankBadge rank={m.rank} /></td>
                <td>{m.callsign || m.username}</td>
                <td style={{ opacity: 0.85 }}>{m.position || '—'}</td>
                <td style={{ opacity: 0.85 }}>{m.unit}</td>
                <td className="fssf-mono" style={{ opacity: 0.7 }}>
                  {m.joinDate ? new Date(m.joinDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="fssf-mono opacity-75">Loading roster…</p>}
        {!loading && !roster.length && <p className="fssf-mono opacity-75">Roster is empty.</p>}
      </div>
    </div>
  );
}
