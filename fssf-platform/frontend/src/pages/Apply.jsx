import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_TAG = {
  pending: 'fssf-tag--warn',
  interview: 'fssf-tag--warn',
  accepted: 'fssf-tag--ok',
  rejected: 'fssf-tag--danger',
};

export default function Apply() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    discordId: '', discordUsername: '', age: '', timezone: '',
    hoursInPavlov: '', experience: '', whyJoin: '', referral: '',
  });
  const [mine, setMine] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, discordId: user.discordId, discordUsername: user.username }));
      api.get('/applications/mine').then((res) => setMine(res.data.applications)).catch(() => {});
    }
  }, [user]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/applications', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Selection</div>
      <h1>Apply to FSSF</h1>
      <p style={{ opacity: 0.85, maxWidth: '42rem' }}>
        We run a short selection process to make sure new operators fit the unit's
        standard. Fill out the form below — command staff typically respond within a
        few days on Discord.
      </p>

      {mine.length > 0 && (
        <div className="fssf-card card p-4 my-4">
          <h5>Your Applications</h5>
          <ul className="list-unstyled mb-0">
            {mine.map((a) => (
              <li key={a.id} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px dashed rgba(207,197,154,0.15)' }}>
                <span className="fssf-mono">{new Date(a.createdAt).toLocaleDateString()}</span>
                <span className={`fssf-tag ${STATUS_TAG[a.status]}`}>{a.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitted ? (
        <div className="fssf-card card p-4">
          <h5>Application Received</h5>
          <p className="mb-0">Command staff will review your application and reach out on Discord.</p>
        </div>
      ) : (
        <form className="fssf-form fssf-card card p-4" onSubmit={submit} style={{ maxWidth: '38rem' }}>
          {error && <div className="text-danger fssf-mono small mb-3">{error}</div>}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Discord Username</label>
              <input required className="form-control" value={form.discordUsername} onChange={update('discordUsername')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Discord ID</label>
              <input required className="form-control" value={form.discordId} onChange={update('discordId')} placeholder="e.g. 123456789012345678" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Age</label>
              <input type="number" min="13" className="form-control" value={form.age} onChange={update('age')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Timezone</label>
              <input className="form-control" value={form.timezone} onChange={update('timezone')} placeholder="e.g. EST" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Hours in Pavlov</label>
              <input type="number" min="0" className="form-control" value={form.hoursInPavlov} onChange={update('hoursInPavlov')} />
            </div>
            <div className="col-12">
              <label className="form-label">Relevant Experience</label>
              <textarea className="form-control" rows={3} value={form.experience} onChange={update('experience')} placeholder="Other units, milsim/tactical games, real-world experience, etc." />
            </div>
            <div className="col-12">
              <label className="form-label">Why do you want to join FSSF?</label>
              <textarea required className="form-control" rows={4} value={form.whyJoin} onChange={update('whyJoin')} />
            </div>
            <div className="col-12">
              <label className="form-label">How did you hear about us?</label>
              <input className="form-control" value={form.referral} onChange={update('referral')} />
            </div>
          </div>
          <button className="btn btn-fssf mt-4" disabled={busy}>{busy ? 'Submitting…' : 'Submit Application'}</button>
        </form>
      )}
    </div>
  );
}
