import { Link } from 'react-router-dom';
import { formatDate, typeLabel } from '../api/client';
import './JobCard.css';

export default function JobCard({ job }) {
  const badgeClass =
    job.type === 'contract' ? 'badge badge-contract' :
    job.type === 'part-time' ? 'badge badge-parttime' : 'badge';

  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className={badgeClass}>{typeLabel(job.type)}</span>
        {job.salary && <span className="salary">{job.salary}</span>}
      </div>
      <h3>{job.title}</h3>
      <p className="company">{job.company} · {job.location}</p>
      <p className="job-desc">{job.description.slice(0, 120)}{job.description.length > 120 ? '…' : ''}</p>
      <div className="job-card-footer">
        <span className="post-date">{formatDate(job.createdAt)}</span>
        <Link to={`/jobs/${job._id}`} className="btn-link">View →</Link>
      </div>
    </article>
  );
}
