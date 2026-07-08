import { useEffect, useState } from 'react';
import api from '../../api/client';

const STATUSES = ['pending', 'interview', 'accepted', 'rejected'];
const STATUS_TAG = { pending: 'fssf-tag--warn', interview: 'fssf-tag--warn', accepted: 'fssf-tag--ok', rejected: 'fssf-tag--danger' };

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [notes, setNotes] = useState({});

  const load = () => api.get('/applications', { params: filter ? { status: filter } : {} }).then((res) => setApplications(res.data.applications));
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status, reviewNotes: notes[id] });
    await load();
  };

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Command Post</div>
      <h1>Recruitment Applications</h1>

      <div className="d-flex gap-2 my-3">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} className={`btn btn-sm ${filter === s ? 'btn-fssf' : 'btn-fssf-outline'}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {applications.map((a) => (
          <div className="col-lg-6" key={a.id}>
            <div className="fssf-card card p-4 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="mb-0">{a.discordUsername}</h5>
                <span className={`fssf-tag ${STATUS_TAG[a.status]}`}>{a.status}</span>
              </div>
              <p className="fssf-mono opacity-75 mb-2">
                Age {a.age || '—'} · {a.timezone || '—'} · {a.hoursInPavlov ?? '—'}h in Pavlov
              </p>
              <p style={{ opacity: 0.9 }}><strong>Why join:</strong> {a.whyJoin}</p>
              {a.experience && <p style={{ opacity: 0.85 }}><strong>Experience:</strong> {a.experience}</p>}
              <textarea
                className="form-control fssf-form mb-2"
                placeholder="Review notes (visible to staff)"
                defaultValue={a.reviewNotes || ''}
                onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))}
                rows={2}
              />
              <div className="d-flex gap-2 flex-wrap">
                {STATUSES.filter((s) => s !== a.status).map((s) => (
                  <button key={s} className="btn btn-fssf-outline btn-sm" onClick={() => setStatus(a.id, s)}>Mark {s}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!applications.length && <p className="fssf-mono opacity-75">No applications in this queue.</p>}
      </div>
    </div>
  );
}
