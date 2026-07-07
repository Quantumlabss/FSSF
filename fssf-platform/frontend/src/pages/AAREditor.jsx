import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function AAREditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventId: '', title: '', summary: '', bodyMarkdown: '', outcome: 'success', published: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/events').then((res) => setEvents(res.data.events));
    if (isEdit) {
      api.get(`/aars/${id}`).then((res) => {
        const a = res.data.aar;
        setForm({
          eventId: a.eventId || '', title: a.title, summary: a.summary || '',
          bodyMarkdown: a.bodyMarkdown, outcome: a.outcome || 'success', published: a.published,
        });
      });
    }
  }, [id]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (publish) => {
    setBusy(true); setError('');
    const payload = { ...form, published: publish };
    try {
      if (isEdit) {
        const res = await api.put(`/aars/${id}`, payload);
        navigate(`/aars/${res.data.aar.id}`);
      } else {
        const res = await api.post('/aars', payload);
        navigate(`/aars/${res.data.aar.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save AAR');
    } finally { setBusy(false); }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '48rem' }}>
      <div className="fssf-section-label">Debrief Editor</div>
      <h1>{isEdit ? 'Edit AAR' : 'New After Action Report'}</h1>

      <div className="fssf-form fssf-card card p-4 mt-3">
        {error && <div className="text-danger fssf-mono small mb-3">{error}</div>}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={update('title')} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Linked Event</label>
            <select className="form-select" value={form.eventId} onChange={update('eventId')}>
              <option value="">— none —</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Outcome</label>
            <select className="form-select" value={form.outcome} onChange={update('outcome')}>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Summary</label>
            <input className="form-control" value={form.summary} onChange={update('summary')} placeholder="One-line summary shown in the AAR list" />
          </div>
          <div className="col-12">
            <label className="form-label">Full Report</label>
            <textarea className="form-control" rows={12} value={form.bodyMarkdown} onChange={update('bodyMarkdown')} placeholder="Objective, execution, what worked, what didn't, follow-up actions…" />
          </div>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-fssf-outline btn-sm" disabled={busy} onClick={() => save(false)}>Save Draft</button>
          <button className="btn btn-fssf btn-sm" disabled={busy} onClick={() => save(true)}>Publish</button>
        </div>
      </div>
    </div>
  );
}
