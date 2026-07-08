async function PageGallery(params, container) {
  if (!Auth.loaded) await Auth.refresh();

  async function load() {
    const res = await api.get('/gallery');
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = res.images.length ? res.images.map((img) => `
      <div class="col-md-4 col-lg-3">
        <div class="fssf-card card h-100">
          <img src="${esc(img.imagePath)}" alt="${esc(img.caption || 'FSSF operation')}" style="width:100%;aspect-ratio:4/3;object-fit:cover">
          <div class="card-body py-2"><small style="opacity:0.8">${esc(img.caption || 'Untitled')}</small></div>
        </div>
      </div>`).join('') : '<p class="fssf-mono opacity-75">No photos uploaded yet.</p>';
  }

  const uploadForm = Auth.hasRole('member') ? `
    <form class="fssf-form fssf-card card p-4 my-4" id="gallery-upload-form" style="max-width:32rem">
      <div class="text-danger fssf-mono small mb-2" id="gallery-error"></div>
      <div class="mb-3">
        <label class="form-label">Image</label>
        <input type="file" accept="image/*" class="form-control" id="gallery-file">
      </div>
      <div class="mb-3">
        <label class="form-label">Caption</label>
        <input class="form-control" id="gallery-caption">
      </div>
      <button class="btn btn-fssf btn-sm" id="gallery-submit">Upload</button>
    </form>` : '';

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Field Photos</div>
      <h1>Gallery</h1>
      ${uploadForm}
      <div class="row g-3" id="gallery-grid"><p class="fssf-mono opacity-75">Loading…</p></div>
    </div>`;

  const form = document.getElementById('gallery-upload-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('gallery-file');
    if (!fileInput.files[0]) return;
    const btn = document.getElementById('gallery-submit');
    btn.disabled = true; btn.textContent = 'Uploading…';
    try {
      const fd = new FormData();
      fd.append('image', fileInput.files[0]);
      fd.append('caption', document.getElementById('gallery-caption').value);
      await api.post('/gallery', fd, true);
      fileInput.value = ''; document.getElementById('gallery-caption').value = '';
      await load();
    } catch (err) {
      document.getElementById('gallery-error').textContent = err.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Upload';
    }
  });

  await load();
}
