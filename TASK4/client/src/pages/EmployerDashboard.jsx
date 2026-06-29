import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, typeLabel, statusLabel } from '../api/client';
import './Dashboard.css';

const emptyJob = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  salary: '',
  description: '',
  requirements: '',
  featured: false
};

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    api.getMyJobs().then(setJobs).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingId) {
        await api.updateJob(editingId, form);
        setMessage('Job updated successfully.');
      } else {
        await api.createJob(form);
        setMessage('Job posted successfully.');
      }
      setForm(emptyJob);
      setEditingId(null);
      loadJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary || '',
      description: job.description,
      requirements: job.requirements || '',
      featured: job.featured
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job listing?')) return;
    try {
      await api.deleteJob(id);
      setMessage('Job deleted.');
      if (selectedJob === id) setSelectedJob(null);
      loadJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewApplicants = async (jobId) => {
    setSelectedJob(jobId);
    try {
      const apps = await api.getJobApplications(jobId);
      setApplications(apps);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.updateApplicationStatus(appId, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status } : a))
      );
      setMessage('Application status updated. Candidate notified by email.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <p>Manage your account, post jobs, and review applicants.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-grid">
        <section className="panel">
          <h2>{editingId ? 'Edit job' : 'Post a new job'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Job title</label>
                <input id="title" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" value={form.company} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={form.location} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={form.type} onChange={handleChange}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="salary">Salary range</label>
              <input id="salary" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. $80k–$100k" />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <textarea id="requirements" name="requirements" value={form.requirements} onChange={handleChange} />
            </div>
            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              Feature on home page
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Post job'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyJob); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Your listings ({jobs.length})</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="muted">No jobs posted yet.</p>
          ) : (
            <ul className="dash-list">
              {jobs.map((job) => (
                <li key={job._id} className={selectedJob === job._id ? 'active' : ''}>
                  <div>
                    <strong>{job.title}</strong>
                    <span className="muted">{job.company} · {typeLabel(job.type)} · {formatDate(job.createdAt)}</span>
                  </div>
                  <div className="dash-actions">
                    <Link to={`/jobs/${job._id}`} className="btn-link">View</Link>
                    <button type="button" className="btn-link" onClick={() => viewApplicants(job._id)}>Applicants</button>
                    <button type="button" className="btn-link" onClick={() => handleEdit(job)}>Edit</button>
                    <button type="button" className="btn-link danger" onClick={() => handleDelete(job._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedJob && (
        <section className="panel applicants-panel">
          <h2>Applicants</h2>
          {applications.length === 0 ? (
            <p className="muted">No applications yet for this job.</p>
          ) : (
            <div className="applicants-grid">
              {applications.map((app) => (
                <article key={app._id} className="applicant-card">
                  <h3>{app.candidate.name}</h3>
                  <p className="muted">{app.candidate.email}</p>
                  {app.candidate.skills && <p><strong>Skills:</strong> {app.candidate.skills}</p>}
                  {app.coverLetter && <p className="cover">{app.coverLetter}</p>}
                  <p>
                    Resume:{' '}
                    <a href={`/uploads/resumes/${app.resumePath}`} target="_blank" rel="noopener noreferrer">
                      {app.resumeOriginalName || 'Download'}
                    </a>
                  </p>
                  <p className={`status status-${app.status}`}>{statusLabel(app.status)}</p>
                  <div className="status-actions">
                    {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${app.status === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => updateStatus(app._id, s)}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
