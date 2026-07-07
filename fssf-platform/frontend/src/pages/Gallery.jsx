import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Gallery() {
  const { hasRole } = useAuth();
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/gallery').then((res) => setImages(res.data.images));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null); setCaption('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="container py-5">
      <div className="fssf-section-label">Field Photos</div>
      <h1>Gallery</h1>

      {hasRole('member') && (
        <form className="fssf-form fssf-card card p-4 my-4" onSubmit={upload} style={{ maxWidth: '32rem' }}>
          {error && <div className="text-danger fssf-mono small mb-2">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Image</label>
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="mb-3">
            <label className="form-label">Caption</label>
            <input className="form-control" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <button className="btn btn-fssf btn-sm" disabled={busy || !file}>{busy ? 'Uploading…' : 'Upload'}</button>
        </form>
      )}

      <div className="row g-3">
        {images.map((img) => (
          <div className="col-md-4 col-lg-3" key={img.id}>
            <div className="fssf-card card h-100">
              <img src={img.imagePath} alt={img.caption || 'FSSF operation'} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
              <div className="card-body py-2">
                <small style={{ opacity: 0.8 }}>{img.caption || 'Untitled'}</small>
              </div>
            </div>
          </div>
        ))}
        {!images.length && <p className="fssf-mono opacity-75">No photos uploaded yet.</p>}
      </div>
    </div>
  );
}
