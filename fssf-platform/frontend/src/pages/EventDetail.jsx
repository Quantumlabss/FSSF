import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [roleSignup, setRoleSignup] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get(`/events/${id}`).then((res) => setEvent(res.data.event));

  useEffect(() => { load(); }, [id]);

  const mySignup = event?.signups?.find((s) => s.user.id === user?.id);

  const signup = async () => {
    setBusy(true); setError('');
    try {
      await api.post(`/events/${id}/signup`, { roleSignup });
      await load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to sign up');
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    setBusy(true);
    try {
      await api.delete(`/events/${id}/signup`);
      await load();
    } finally { setBusy(false); }
  };

  if (!event) return <div className="container py-5 fssf-mono opacity-75">Loading briefing…</div>;

  const date = new Date(event.eventDate);
  const confirmed = event.signups.filter((s) => s.status === 'confirmed');
  const waitlist = event.signups.filter((s) => s.status === 'waitlist');

  return (
    <div className="container py-5">
      <div className="fssf-section-label">{event.eventType}</div>
      <h1>{event.title}</h1>
      <p className="fssf-mono opacity-75">
        {date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
        {event.mapName ? ` · Map: ${event.mapName}` : ''}
        {event.durationMinutes ? ` · ~${event.durationMinutes} min` : ''}
      </p>

      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <div className="fssf-card card p-4 mb-4">
            <h5>Briefing</h5>
            <p className="mb-0" style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>
              {event.description || 'Full briefing to be issued closer to step-off.'}
            </p>
          </div>

          {user ? (
            <div className="fssf-card card p-4">
              <h5>Signup</h5>
              {error && <div className="text-danger fssf-mono small mb-2">{error}</div>}
              {mySignup ? (
                <div>
                  <p className="mb-3">
                    You're signed up as <strong>{mySignup.status === 'waitlist' ? 'WAITLISTED' : 'CONFIRMED'}</strong>
                    {mySignup.roleSignup ? ` — ${mySignup.roleSignup}` : ''}.
                  </p>
                  <button className="btn btn-fssf-outline btn-sm" disabled={busy} onClick={withdraw}>Withdraw</button>
                </div>
              ) : (
                <div className="fssf-form">
                  <div className="mb-3">
                    <label className="form-label">Preferred Role (optional)</label>
                    <input className="form-control" value={roleSignup} onChange={(e) => setRoleSignup(e.target.value)} placeholder="e.g. Rifleman, SAW gunner, Medic" />
                  </div>
                  <button className="btn btn-fssf btn-sm" disabled={busy} onClick={signup}>Confirm Signup</button>
                </div>
              )}
            </div>
          ) : (
            <div className="fssf-card card p-4">
              <p className="mb-0">Log in with Discord to sign up for this operation.</p>
            </div>
          )}
        </div>

        <div className="col-lg-5">
          <div className="fssf-card card p-4">
            <h5>Roster ({confirmed.length}{event.maxSlots ? `/${event.maxSlots}` : ''})</h5>
            <ul className="list-unstyled mb-0">
              {confirmed.map((s) => (
                <li key={s.id} className="fssf-mono d-flex justify-content-between py-1" style={{ borderBottom: '1px dashed rgba(207,197,154,0.15)' }}>
                  <span>{s.user.callsign || s.user.username}</span>
                  <span style={{ opacity: 0.7 }}>{s.roleSignup || '—'}</span>
                </li>
              ))}
              {!confirmed.length && <li className="opacity-75">No confirmed signups yet.</li>}
            </ul>
            {waitlist.length > 0 && (
              <>
                <h6 className="mt-3">Waitlist</h6>
                <ul className="list-unstyled mb-0">
                  {waitlist.map((s) => (
                    <li key={s.id} className="fssf-mono py-1">{s.user.callsign || s.user.username}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
