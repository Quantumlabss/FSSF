import { Link } from 'react-router-dom';

const TYPE_TAG = {
  operation: 'fssf-tag--danger',
  training: 'fssf-tag--ok',
  selection: 'fssf-tag--warn',
  social: 'fssf-tag--ok',
  other: 'fssf-tag--warn',
};

export default function EventCard({ event }) {
  const date = new Date(event.eventDate);
  const confirmed = (event.signups || []).filter((s) => s.status === 'confirmed').length;

  return (
    <div className="fssf-card card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>{event.eventType}</span>
        <span className={`fssf-tag ${TYPE_TAG[event.eventType] || 'fssf-tag--ok'}`}>
          {event.maxSlots ? `${confirmed}/${event.maxSlots} SLOTS` : `${confirmed} SIGNED UP`}
        </span>
      </div>
      <div className="card-body">
        <h5 className="mb-1">{event.title}</h5>
        <p className="fssf-mono mb-2" style={{ fontSize: '0.8rem', opacity: 0.85 }}>
          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} — {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          {event.mapName ? ` · ${event.mapName}` : ''}
        </p>
        <p className="mb-3" style={{ opacity: 0.9 }}>
          {event.description?.slice(0, 130) || 'No briefing provided yet.'}
          {event.description?.length > 130 ? '…' : ''}
        </p>
        <Link to={`/events/${event.id}`} className="btn btn-fssf-outline btn-sm">View Briefing</Link>
      </div>
    </div>
  );
}
