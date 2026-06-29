import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';
import { notifyApplicationSubmitted, notifyStatusUpdate } from '../utils/email.js';

const router = express.Router();

router.post('/', authRequired, requireRole('candidate'), uploadResume.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    if (!req.file) return res.status(400).json({ message: 'Resume file is required' });

    const job = await Job.findById(jobId).populate('employer', 'email name');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = await Application.findOne({ job: jobId, candidate: req.userId });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    const candidate = await User.findById(req.userId);

    const application = await Application.create({
      job: jobId,
      candidate: req.userId,
      coverLetter: coverLetter || '',
      resumePath: req.file.filename,
      resumeOriginalName: req.file.originalname
    });

    await notifyApplicationSubmitted({
      candidate,
      job,
      employerEmail: job.employer?.email
    });

    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', authRequired, requireRole('candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.userId })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/job/:jobId', authRequired, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email phone skills bio')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', authRequired, requireRole('employer'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'name email');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findById(application.job._id);
    if (job.employer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    await notifyStatusUpdate({
      candidate: application.candidate,
      job: application.job,
      status
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
