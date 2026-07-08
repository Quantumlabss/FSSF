import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/admin/summary').then((res) => setStats(res.data)); }, []);

  const CARDS = [
    { label: 'Active Members', value: stats?.memberCount, to: '/admin/roster' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents, to: '/admin/events' },
    { label: 'Pending Applications', value: stats?.pendingApplications, to: '/admin/applications' },
    { label: 'Draft AARs', value: stats?.draftAars, to: '/aars' },
    { label: 'Gallery Photos', value: stats?.galleryCount, to: '/gallery' },
  ];

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Command Post</div>
      <h1>Command Dashboard</h1>

      <div className="row g-3 mt-2">
        {CARDS.map((c) => (
          <div className="col-md-4 col-lg-3" key={c.label}>
            <Link to={c.to} className="text-decoration-none">
              <div className="fssf-card card p-4 h-100">
                <div className="fssf-mono" style={{ fontSize: '2rem' }}>{c.value ?? '—'}</div>
                <div style={{ opacity: 0.8 }}>{c.label}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="fssf-divider" />

      <div className="d-flex flex-wrap gap-3">
        <Link to="/admin/events" className="btn btn-fssf-outline">Manage Events</Link>
        <Link to="/admin/applications" className="btn btn-fssf-outline">Review Applications</Link>
        <Link to="/admin/roster" className="btn btn-fssf-outline">Manage Roster</Link>
        <Link to="/admin/promotions" className="btn btn-fssf-outline">Issue Promotion</Link>
        <Link to="/aars/new" className="btn btn-fssf-outline">Write AAR</Link>
      </div>
    </div>
  );
}
