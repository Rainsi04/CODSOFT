import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatDate, typeLabel } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getJob(id)
      .then(setJob)
      .catch(() => setError('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in as a candidate to apply.');
      return;
    }

    if (user.role !== 'candidate') {
      setError('Only candidates can apply for jobs.');
      return;
    }

    if (!resume) {
      setError('Please upload your resume.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);
      await api.apply(formData);
      setSuccess('Application submitted! You will receive an email confirmation.');
      setCoverLetter('');
      setResume(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!job) return <div className="container page-loading">{error || 'Job not found'}</div>;

  const badgeClass =
    job.type === 'contract' ? 'badge badge-contract' :
    job.type === 'part-time' ? 'badge badge-parttime' : 'badge';

  return (
    <div className="job-detail container">
      <Link to="/jobs" className="back-link">← Back to listings</Link>

      <div className="detail-grid">
        <article className="detail-main">
          <div className="detail-top">
            <span className={badgeClass}>{typeLabel(job.type)}</span>
            {job.salary && <span className="salary">{job.salary}</span>}
          </div>
          <h1>{job.title}</h1>
          <p className="company">{job.company} · {job.location}</p>
          <p className="post-date">{formatDate(job.createdAt)}</p>

          <section className="detail-section">
            <h2>Description</h2>
            <p>{job.description}</p>
          </section>

          {job.requirements && (
            <section className="detail-section">
              <h2>Requirements</h2>
              <p>{job.requirements}</p>
            </section>
          )}
        </article>

        <aside className="apply-panel">
          <h2>Apply for this role</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!user ? (
            <p className="apply-hint">
              <Link to="/login">Log in</Link> or <Link to="/register">sign up</Link> as a candidate to apply.
            </p>
          ) : user.role !== 'candidate' ? (
            <p className="apply-hint">Switch to a candidate account to apply.</p>
          ) : (
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover letter (optional)</label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're a great fit…"
                />
              </div>
              <div className="form-group">
                <label htmlFor="resume">Resume (PDF, DOC, DOCX)</label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
