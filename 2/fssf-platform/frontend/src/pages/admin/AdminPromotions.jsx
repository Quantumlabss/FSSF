import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminPromotions() {
  const [roster, setRoster] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({ userId: '', newRankId: '', reason: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/roster').then((res) => setRoster(res.data.roster));
    api.get('/roster/ranks').then((res) => setRanks(res.data.ranks));
    api.get('/promotions').then((res) => setPromotions(res.data.promotions));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/promotions', form);
      setForm({ userId: '', newRankId: '', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue promotion');
    }
  };

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Command Post</div>
      <h1>Promotions</h1>

      <form className="fssf-form fssf-card card p-4 my-4" onSubmit={submit} style={{ maxWidth: '32rem' }}>
        {error && <div className="text-danger fssf-mono small mb-2">{error}</div>}
        <h5>Issue Promotion</h5>
        <div className="mb-3">
          <label className="form-label">Member</label>
          <select required className="form-select" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
            <option value="">Select member…</option>
            {roster.map((m) => <option key={m.id} value={m.id}>{m.callsign || m.username} ({m.rank?.abbreviation || 'RCT'})</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">New Rank</label>
          <select required className="form-select" value={form.newRankId} onChange={(e) => setForm((f) => ({ ...f, newRankId: e.target.value }))}>
            <option value="">Select rank…</option>
            {ranks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea className="form-control" rows={2} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
        </div>
        <button className="btn btn-fssf btn-sm">Issue Promotion</button>
        <p className="fssf-mono mt-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
          Note: this updates the member's rank in-app. The Discord bot's role-sync cycle
          reconciles their Discord role automatically on its next pass.
        </p>
      </form>

      <div className="table-responsive">
        <table className="table fssf-table align-middle">
          <thead><tr><th>Member</th><th>Change</th><th>Reason</th><th>Issued By</th><th>Date</th></tr></thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id}>
                <td>{p.user?.callsign || p.user?.username}</td>
                <td className="fssf-mono">{p.oldRank?.abbreviation || '—'} → {p.newRank?.abbreviation}</td>
                <td style={{ opacity: 0.85 }}>{p.reason || '—'}</td>
                <td>{p.issuer?.callsign || p.issuer?.username || '—'}</td>
                <td className="fssf-mono">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
