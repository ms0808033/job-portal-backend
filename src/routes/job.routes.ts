// backend/src/routes/job.routes.ts
import { Router } from 'express';
import { createJob, getActiveJobs } from '../controllers/job.controller';

const router = Router();

// GET /api/jobs/active
router.get('/active', getActiveJobs);

// POST /api/jobs
router.post('/', createJob);

export default router;