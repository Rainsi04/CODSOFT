import express from 'express';
import Job from '../models/Job.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, type, location } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('employer', 'name company email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/featured', async (_req, res) => {
  try {
    const jobs = await Job.find({ featured: true })
      .populate('employer', 'name company')
      .sort({ createdAt: -1 })
      .limit(6);

    if (jobs.length === 0) {
      const fallback = await Job.find()
        .populate('employer', 'name company')
        .sort({ createdAt: -1 })
        .limit(3);
      return res.json(fallback);
    }

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/employer/mine', authRequired, requireRole('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authRequired, requireRole('employer'), async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements, featured } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: 'Title, company, location, and description are required' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type: type || 'full-time',
      salary: salary || '',
      description,
      requirements: requirements || '',
      featured: Boolean(featured),
      employer: req.userId
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authRequired, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const fields = ['title', 'company', 'location', 'type', 'salary', 'description', 'requirements', 'featured'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authRequired, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
