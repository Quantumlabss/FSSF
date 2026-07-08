// ==========================================================================
// FSSF static site config
// This is the ONLY file you need to edit before hosting: point API_BASE at
// wherever your backend (from the /backend folder) is deployed.
//
// Examples:
//   Same server, reverse-proxied at /api  ->  const API_BASE = '/api';
//   Separate host                         ->  const API_BASE = 'https://api.yourdomain.com/api';
// ==========================================================================
window.FSSF_CONFIG = {
  API_BASE: 'http://localhost:4000/api',
};
