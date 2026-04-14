// backend/src/routes/job.routes.ts
import { Router } from 'express';
import { createRequisition, getActiveJobs } from '../controllers/job.controller';

const router = Router();

// Public Candidate Routes
router.get('/active', getActiveJobs);

// Internal HR/Recruiter Routes (Requires Auth & Tenant Middleware)
router.post('/requisitions', createRequisition);

export default router;