import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Job from './models/Job.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/boardjobs');

  const count = await Job.countDocuments();
  if (count > 0) {
    console.log('Database already has jobs — skipping seed.');
    process.exit(0);
  }

  let employer = await User.findOne({ email: 'employer@boardjobs.com' });
  if (!employer) {
    employer = await User.create({
      name: 'Demo Employer',
      email: 'employer@boardjobs.com',
      password: 'demo123',
      role: 'employer',
      company: 'BoardJobs Inc.'
    });
  }

  let candidate = await User.findOne({ email: 'candidate@boardjobs.com' });
  if (!candidate) {
    candidate = await User.create({
      name: 'Demo Candidate',
      email: 'candidate@boardjobs.com',
      password: 'demo123',
      role: 'candidate',
      skills: 'HTML, CSS, JavaScript, React'
    });
  }

  await Job.insertMany([
    {
      title: 'Senior Product Designer',
      company: 'Nordic Design',
      location: 'Remote',
      type: 'full-time',
      salary: '$120k–$150k',
      description: 'Lead design systems and product strategy across cross-functional teams. You will own the end-to-end design process from research to high-fidelity prototypes.',
      requirements: '5+ years product design experience, Figma, design systems',
      featured: true,
      employer: employer._id
    },
    {
      title: 'Front-end Developer',
      company: 'Stellar Labs',
      location: 'Hybrid (NYC)',
      type: 'contract',
      salary: '$90k–$110k',
      description: 'Build performant, accessible web interfaces using modern JavaScript. 6-month contract with possible extension.',
      requirements: 'React, JavaScript, CSS, accessibility best practices',
      featured: true,
      employer: employer._id
    },
    {
      title: 'Data Analyst',
      company: 'Insight Partners',
      location: 'Remote',
      type: 'part-time',
      salary: '$70k–$85k',
      description: 'Analyze business data, build dashboards, and deliver actionable insights. Flexible 20h/week schedule.',
      requirements: 'SQL, Python, Excel, data visualization',
      featured: true,
      employer: employer._id
    },
    {
      title: 'Full Stack Engineer',
      company: 'BoardJobs Inc.',
      location: 'Remote',
      type: 'full-time',
      salary: '$100k–$130k',
      description: 'Work on our job board platform using React, Node.js, and MongoDB. Help employers and candidates connect.',
      requirements: 'React, Node.js, MongoDB, REST APIs',
      featured: false,
      employer: employer._id
    }
  ]);

  console.log('Seed complete!');
  console.log('Demo employer: employer@boardjobs.com / demo123');
  console.log('Demo candidate: candidate@boardjobs.com / demo123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
