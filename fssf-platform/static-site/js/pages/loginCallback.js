async function PageLoginCallback(params, container) {
  container.innerHTML = '<div class="container py-5 text-center fssf-mono opacity-75">Verifying credentials…</div>';
  await Auth.refresh();
  location.hash = '#/';
}
