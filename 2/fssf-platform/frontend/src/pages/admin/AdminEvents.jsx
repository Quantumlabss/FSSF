import { useEffect, useState } from 'react';
import api from '../../api/client';

const EMPTY = { title: '', description: '', eventType: 'operation', mapName: '', eventDate: '', durationMinutes: 90, maxSlots: '' };

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/events').then((res) => setEvents(res.data.events));
  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
      } else {
        await api.post('/events', form);
      }
      setForm(EMPTY); setEditingId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event');
    }
  };

  const edit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title, description: ev.description || '', eventType: ev.eventType,
      mapName: ev.mapName || '', eventDate: ev.eventDate.slice(0, 16), durationMinutes: ev.durationMinutes || 90,
      maxSlots: ev.maxSlots || '',
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`);
    await load();
  };

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Command Post</div>
      <h1>Manage Events</h1>

      <form className="fssf-form fssf-card card p-4 my-4" onSubmit={submit}>
        {error && <div className="text-danger fssf-mono small mb-2">{error}</div>}
        <h5>{editingId ? 'Edit Event' : 'New Event'}</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input required className="form-control" value={form.title} onChange={update('title')} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.eventType} onChange={update('eventType')}>
              {['operation', 'training', 'selection', 'social', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Map</label>
            <input className="form-control" value={form.mapName} onChange={update('mapName')} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date &amp; Time</label>
            <input required type="datetime-local" className="form-control" value={form.eventDate} onChange={update('eventDate')} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Duration (min)</label>
            <input type="number" className="form-control" value={form.durationMinutes} onChange={update('durationMinutes')} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Max Slots</label>
            <input type="number" className="form-control" value={form.maxSlots} onChange={update('maxSlots')} />
          </div>
          <div className="col-12">
            <label className="form-label">Briefing / Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={update('description')} />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-fssf btn-sm">{editingId ? 'Save Changes' : 'Create Event'}</button>
          {editingId && <button type="button" className="btn btn-fssf-outline btn-sm" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table fssf-table align-middle">
          <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Signups</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.eventType}</td>
                <td className="fssf-mono">{new Date(e.eventDate).toLocaleString()}</td>
                <td>{e.signups.length}{e.maxSlots ? `/${e.maxSlots}` : ''}</td>
                <td className="text-end">
                  <button className="btn btn-fssf-outline btn-sm me-2" onClick={() => edit(e)}>Edit</button>
                  <button className="btn btn-fssf-outline btn-sm" onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
