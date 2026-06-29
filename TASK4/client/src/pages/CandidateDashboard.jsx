import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, statusLabel } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function CandidateDashboard() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    skills: user?.skills || ''
  });
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications()
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.updateProfile(profile);
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>Candidate Dashboard</h1>
        <p>Manage your profile and track job applications.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-grid">
        <section className="panel">
          <h2>My profile</h2>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={profile.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={profile.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="skills">Skills</label>
              <input id="skills" name="skills" value={profile.skills} onChange={handleChange} placeholder="e.g. HTML, CSS, React" />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" value={profile.bio} onChange={handleChange} placeholder="Short professional summary…" />
            </div>
            <button type="submit" className="btn btn-primary">Save profile</button>
          </form>
        </section>

        <section className="panel">
          <h2>My applications ({applications.length})</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : applications.length === 0 ? (
            <p className="muted">No applications yet. <Link to="/jobs">Browse jobs →</Link></p>
          ) : (
            <ul className="dash-list">
              {applications.map((app) => (
                <li key={app._id}>
                  <div>
                    <strong>{app.job?.title || 'Job'}</strong>
                    <span className="muted">{app.job?.company} · {app.job?.location}</span>
                    <span className={`status status-${app.status}`}>{statusLabel(app.status)}</span>
                  </div>
                  <Link to={`/jobs/${app.job?._id}`} className="btn-link">View job →</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
