import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import JobCard from '../components/JobCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeaturedJobs()
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="hero-badge">Curated opportunities</span>
          <h1>Build your <span className="highlight">next career</span></h1>
          <p className="hero-sub">
            Employers post openings. Candidates search, apply, and track applications — all in one place.
          </p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search jobs, keywords, or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="hero-stats">
            <span>Employer dashboard</span>
            <span>Candidate profiles</span>
            <span>Resume upload</span>
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <div className="section-header">
            <h2>Featured openings</h2>
            <Link to="/jobs" className="view-all">View all →</Link>
          </div>
          {loading ? (
            <p className="page-loading">Loading jobs…</p>
          ) : featured.length === 0 ? (
            <p className="empty-msg">No jobs yet. Employers can post from their dashboard.</p>
          ) : (
            <div className="job-grid">
              {featured.map((job) => <JobCard key={job._id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      <section className="role-cta">
        <div className="container role-grid">
          <article className="role-card">
            <div className="role-icon">📌</div>
            <h3>Employer</h3>
            <p>Post jobs, manage listings, and review applicants from your dashboard.</p>
            <Link to="/employer/dashboard" className="btn btn-secondary">Dashboard →</Link>
          </article>
          <article className="role-card">
            <div className="role-icon">💻</div>
            <h3>Candidate</h3>
            <p>Build your profile, upload a resume, and track your applications.</p>
            <Link to="/candidate/dashboard" className="btn btn-secondary">My Profile →</Link>
          </article>
        </div>
      </section>
    </>
  );
}
