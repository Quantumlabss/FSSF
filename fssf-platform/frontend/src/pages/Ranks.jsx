import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Ranks() {
  const [ranks, setRanks] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    api.get('/roster/ranks').then((res) => setRanks(res.data.ranks));
    api.get('/promotions').then((res) => setPromotions(res.data.promotions.slice(0, 20)));
  }, []);

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Chain of Command</div>
      <h1>Ranks &amp; Promotions</h1>

      <div className="row g-4 mt-2">
        <div className="col-lg-6">
          <div className="fssf-card card p-4">
            <h5>Rank Structure</h5>
            <ol className="list-unstyled mb-0">
              {[...ranks].reverse().map((r) => (
                <li key={r.id} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px dashed rgba(207,197,154,0.15)' }}>
                  <span>{r.name}</span>
                  <span className="fssf-mono opacity-75">{r.abbreviation}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="fssf-card card p-4">
            <h5>Recent Promotions</h5>
            <ul className="list-unstyled mb-0">
              {promotions.map((p) => (
                <li key={p.id} className="py-2" style={{ borderBottom: '1px dashed rgba(207,197,154,0.15)' }}>
                  <strong>{p.user?.callsign || p.user?.username}</strong>{' '}
                  <span className="fssf-mono opacity-75">
                    {p.oldRank?.abbreviation || '—'} → {p.newRank?.abbreviation}
                  </span>
                  <div className="fssf-mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
              {!promotions.length && <li className="opacity-75">No promotions recorded yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
