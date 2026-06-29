import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import JobCard from '../components/JobCard';
import './Jobs.css';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    setLoading(true);
    const params = {};
    const query = searchParams.get('q');
    const typeParam = searchParams.get('type');
    const locParam = searchParams.get('location');
    if (query) params.q = query;
    if (typeParam) params.type = typeParam;
    if (locParam) params.location = locParam;

    api.getJobs(params)
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (q) params.q = q;
    if (type) params.type = type;
    if (location) params.location = location;
    setSearchParams(params);
  };

  return (
    <div className="jobs-page container">
      <div className="section-header">
        <h2>Job listings</h2>
        <span className="job-count">{jobs.length} result{jobs.length !== 1 ? 's' : ''}</span>
      </div>

      <form className="filter-bar" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="Search keywords…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
      </form>

      {loading ? (
        <p className="page-loading">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p className="empty-msg">No jobs match your search.</p>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
