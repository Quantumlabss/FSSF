import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoster() {
  const { hasRole } = useAuth();
  const [roster, setRoster] = useState([]);
  const [edits, setEdits] = useState({});

  const load = () => api.get('/roster').then((res) => setRoster(res.data.roster));
  useEffect(() => { load(); }, []);

  const setEdit = (id, field, value) => setEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));

  const save = async (id) => {
    const patch = edits[id];
    if (!patch) return;
    await api.put(`/roster/${id}`, patch);
    setEdits((e) => { const c = { ...e }; delete c[id]; return c; });
    await load();
  };

  const deactivate = async (id) => {
    if (!confirm('Remove this member from the active roster?')) return;
    await api.delete(`/roster/${id}`);
    await load();
  };

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Command Post</div>
      <h1>Manage Roster</h1>
      <p className="fssf-mono opacity-75">Rank &amp; permission level sync automatically from Discord roles. Position/callsign can be edited here.</p>

      <div className="table-responsive mt-3">
        <table className="table fssf-table align-middle">
          <thead>
            <tr><th>Callsign</th><th>Rank</th><th>Position</th>{hasRole('officer') && <th>Permission</th>}<th></th></tr>
          </thead>
          <tbody>
            {roster.map((m) => (
              <tr key={m.id}>
                <td>
                  <input
                    className="form-control form-control-sm fssf-form"
                    defaultValue={m.callsign || ''}
                    placeholder={m.username}
                    onChange={(e) => setEdit(m.id, 'callsign', e.target.value)}
                  />
                </td>
                <td className="fssf-mono">{m.rank?.abbreviation || 'RCT'}</td>
                <td>
                  <input
                    className="form-control form-control-sm fssf-form"
                    defaultValue={m.position || ''}
                    onChange={(e) => setEdit(m.id, 'position', e.target.value)}
                  />
                </td>
                {hasRole('officer') && (
                  <td>
                    <select
                      className="form-select form-select-sm fssf-form"
                      defaultValue={m.role}
                      onChange={(e) => setEdit(m.id, 'role', e.target.value)}
                    >
                      {['recruit', 'member', 'nco', 'officer', 'admin'].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                )}
                <td className="text-end">
                  <button className="btn btn-fssf-outline btn-sm me-2" onClick={() => save(m.id)}>Save</button>
                  <button className="btn btn-fssf-outline btn-sm" onClick={() => deactivate(m.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
