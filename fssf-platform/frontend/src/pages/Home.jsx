import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    api.get('/events').then((res) => setEvents(res.data.events.slice(0, 3))).catch(() => {});
    api.get('/roster').then((res) => setRoster(res.data.roster)).catch(() => {});
  }, []);

  return (
    <>
      <section className="fssf-hero">
        <div className="container position-relative">
          <div className="eyebrow">Pavlov VR // Milsim Unit // Est. 2026</div>
          <h1>First Special<br />Service Force</h1>
          <p className="lead">
            A joint Canadian-American strike force built for coordinated small-unit tactics
            in Pavlov VR. We run structured operations, hold members to a standard, and
            train the way we fight — together.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <Link to="/apply" className="btn btn-fssf">Apply For Selection</Link>
            <Link to="/events" className="btn btn-fssf-outline">View Operations Calendar</Link>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-3">
          <div>
            <div className="fssf-section-label">Sitrep</div>
            <h2 className="mb-0">Upcoming Operations</h2>
          </div>
          <Link to="/events" className="btn btn-fssf-outline btn-sm">Full Calendar</Link>
        </div>
        <div className="row g-4">
          {events.length ? events.map((e) => (
            <div className="col-md-4" key={e.id}><EventCard event={e} /></div>
          )) : (
            <p className="fssf-mono opacity-75">No operations currently scheduled — check back soon.</p>
          )}
        </div>
      </section>

      <section className="container pb-5">
        <div className="fssf-divider" />
        <div className="row g-4 align-items-center">
          <div className="col-lg-5">
            <div className="fssf-section-label">Force Strength</div>
            <h2>{roster.length} Active Operators</h2>
            <p style={{ opacity: 0.85 }}>
              Every rank on the roster below is synced live from our Discord server,
              so what you see here is exactly who is on deck for the next op.
            </p>
            <Link to="/roster" className="btn btn-fssf-outline btn-sm">View Full Roster</Link>
          </div>
          <div className="col-lg-7">
            <div className="fssf-card card p-3">
              <div className="d-flex flex-wrap gap-2">
                {roster.slice(0, 14).map((m) => (
                  <span key={m.id} className="fssf-rank-badge">
                    {m.rank?.abbreviation || 'RCT'} · {m.callsign || m.username}
                  </span>
                ))}
                {!roster.length && <span className="fssf-mono opacity-75">Roster syncing…</span>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
