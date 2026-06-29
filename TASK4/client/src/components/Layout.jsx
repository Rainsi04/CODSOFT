import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const dashLink =
    user?.role === 'employer'
      ? '/employer/dashboard'
      : user?.role === 'candidate'
        ? '/candidate/dashboard'
        : null;

  return (
    <>
      <header className="header">
        <nav className="nav container">
          <Link to="/" className="logo" onClick={() => setOpen(false)}>
            <span className="logo-icon">B</span>
            BoardJobs
          </Link>

          <button
            className={`nav-toggle ${open ? 'active' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span /><span /><span />
          </button>

          <ul className={`nav-links ${open ? 'open' : ''}`}>
            <li><NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/jobs" onClick={() => setOpen(false)}>Listings</NavLink></li>
            {user?.role === 'employer' && (
              <li><NavLink to="/employer/dashboard" onClick={() => setOpen(false)}>Employer</NavLink></li>
            )}
            {user?.role === 'candidate' && (
              <li><NavLink to="/candidate/dashboard" onClick={() => setOpen(false)}>Candidate</NavLink></li>
            )}
          </ul>

          <div className="auth-links">
            {user ? (
              <>
                {dashLink && (
                  <Link to={dashLink} className="login-link">Dashboard</Link>
                )}
                <span className="user-name">{user.name}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container footer-inner">
          <p className="footer-logo"><span className="logo-icon">B</span> BoardJobs</p>
          <p className="footer-copy">&copy; 2026 BoardJobs. Job board for employers and candidates.</p>
          <ul className="footer-links">
            <li><Link to="/jobs">Listings</Link></li>
            <li><Link to="/register">Sign up</Link></li>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}
