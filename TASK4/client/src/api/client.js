const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  getJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/jobs${qs ? `?${qs}` : ''}`);
  },
  getFeaturedJobs: () => request('/jobs/featured'),
  getJob: (id) => request(`/jobs/${id}`),
  getMyJobs: () => request('/jobs/employer/mine'),
  createJob: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateJob: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  apply: (formData) => request('/applications', { method: 'POST', body: formData }),
  getMyApplications: () => request('/applications/mine'),
  getJobApplications: (jobId) => request(`/applications/job/${jobId}`),
  updateApplicationStatus: (id, status) =>
    request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Posted today';
  if (diff === 1) return 'Posted 1d ago';
  if (diff < 7) return `Posted ${diff}d ago`;
  if (diff < 14) return 'Posted 1w ago';
  return d.toLocaleDateString();
}

export function typeLabel(type) {
  const map = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract' };
  return map[type] || type;
}

export function statusLabel(status) {
  const map = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    accepted: 'Accepted',
    rejected: 'Rejected'
  };
  return map[status] || status;
}
