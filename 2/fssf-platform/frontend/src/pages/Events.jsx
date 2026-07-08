import { useEffect, useState } from 'react';
import api from '../api/client';
import EventCard from '../components/EventCard';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then((res) => setEvents(res.data.events)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Operations Calendar</div>
      <h1>Events</h1>
      {loading && <p className="fssf-mono opacity-75">Loading operations calendar…</p>}
      <div className="row g-4 mt-2">
        {events.map((e) => (
          <div className="col-md-4" key={e.id}><EventCard event={e} /></div>
        ))}
        {!loading && !events.length && (
          <p className="fssf-mono opacity-75">No operations currently scheduled.</p>
        )}
      </div>
    </div>
  );
}
