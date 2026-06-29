# BoardJobs — Level 2 Task 1: Job Board

A full-stack job board where employers post openings and candidates search, apply, and track applications.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Email | Nodemailer (console fallback) |
| Uploads | Multer (resume PDF/DOC/DOCX) |

## Features (per assignment)

- **Home page** — welcome message + featured job listings + search
- **Job listings page** — searchable/filterable job list
- **Job detail page** — full job info + application form with resume upload
- **Employer dashboard** — post/edit/delete jobs, review applicants, update status
- **Candidate dashboard** — profile management + application tracking
- **Search** — keywords, location, job type
- **Email notifications** — on apply + status change (configure SMTP or console log)
- **Authentication** — secure register/login with role-based access
- **Mobile responsive** — works on all screen sizes

## Project structure

```
task4/
├── client/          React frontend
├── server/          Express API + MongoDB
└── README.md
```

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env if needed (MONGODB_URI, JWT_SECRET)
npm run seed    # optional — adds demo jobs + accounts
npm run dev
```

API runs at **http://localhost:5000**

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Employer | employer@boardjobs.com | demo123 |
| Candidate | candidate@boardjobs.com | demo123 |

## Email notifications

By default, emails are **printed to the server console**. To send real emails, set these in `server/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=BoardJobs <noreply@boardjobs.com>
```

## Hosting

### Frontend (Netlify / GitHub Pages / Vercel)

```bash
cd client
npm run build
```

Deploy the `client/dist` folder. Set the API URL via environment variable or update the Vite proxy for production.

### Backend (Render / Railway / Heroku)

- Deploy the `server` folder
- Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and optional SMTP vars
- Ensure `uploads/resumes` is writable (or use cloud storage for production)

### Database

Use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier and paste the connection string into `MONGODB_URI`.

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register employer or candidate |
| POST | `/api/auth/login` | Login |
| GET | `/api/jobs` | List/search jobs |
| GET | `/api/jobs/featured` | Featured jobs for home |
| GET | `/api/jobs/:id` | Job details |
| POST | `/api/jobs` | Post job (employer) |
| POST | `/api/applications` | Apply with resume (candidate) |
| GET | `/api/applications/mine` | Candidate applications |
| PATCH | `/api/applications/:id/status` | Update status (employer) |

## Design

Uses the same dark CalcPro theme as tasks 1–3: Inter + Orbitron fonts, blue accent (`#4a9eff`), elevated cards, and mobile-friendly layout.
